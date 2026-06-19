import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { RpcException } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refresh-token.dto';
@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(data: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });

        if (existingUser) {
            throw new RpcException({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password_hash: hashedPassword,
            },
        });

        return {
            success: true,
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
            },
        };
    }

    async login(data: LoginDto) {
        console.log('Login attempt started for email:', data.email);
        const user = await this.prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });

        if (!user) {
            console.log('Login failed: User not found for email:', data.email);
            throw new RpcException('Invalid credentials');
        }
        console.log('User found with ID:', user.id);

        const isPasswordValid = await bcrypt.compare(
            data.password,
            user.password_hash,
        );

        if (!isPasswordValid) {
            console.log('Login failed: Password mismatch for email:', data.email);
            throw new RpcException('Invalid credentials');
        }
        console.log('Password verified successfully for email:', data.email);

        const accessPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const refreshPayload = {
            sub: user.id,
        };

        const sessionExpiresAt = new Date();

        sessionExpiresAt.setDate(
            sessionExpiresAt.getDate() + 7,
        );
        const accessToken = await this.jwtService.signAsync(
            accessPayload,
            {
                expiresIn: '15m',
            },
        );

        const refreshToken = await this.jwtService.signAsync(
            refreshPayload,
            {
                expiresIn: '7d',
            },
        );

        const refreshTokenHash =
            await bcrypt.hash(refreshToken, 10);

        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                refresh_token_hash: refreshTokenHash,
                session_expires_at: sessionExpiresAt
            },
        });

        return {
            success: true,
            message: 'Login successful',
            refresh_token: refreshToken,
            access_token: accessToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        };
    }

    async refresh(data: RefreshTokenDto) {
        let token = data.refresh_token;
        if (token && token.startsWith('Bearer ')) {
            token = token.replace('Bearer ', '');
        }

        let payload;
        console.log('Verifying refresh token...');
        try {
            payload = await this.jwtService.verifyAsync(token);
        } catch (err) {
            console.log('JWT verification failed:', err.message);
            throw new RpcException('Invalid refresh token');
        }

        if (payload.email || payload.role) {
            console.log('User passed an access token instead of a refresh token.');
            throw new RpcException('Provided token is an access token, not a refresh token');
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
            },
        });

        if (!user) {
            throw new RpcException('User not found');
        }

        if (
            !user.session_expires_at ||
            user.session_expires_at < new Date()
        ) {
            throw new RpcException('Session expired');
        }

        const isValid = await bcrypt.compare(
            token,
            user.refresh_token_hash!,
        );

        if (!isValid) {
            console.log('Bcrypt comparison failed between provided token and stored hash.');
            throw new RpcException('Invalid refresh token');
        }
        const accessPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const refreshPayload = {
            sub: user.id,
        };

        const accessToken =
            await this.jwtService.signAsync(
                accessPayload,
                {
                    expiresIn: '15m',
                },
            );

        const refreshToken =
            await this.jwtService.signAsync(
                refreshPayload,
                {
                    expiresIn: '7d',
                },
            );
        const refreshTokenHash =
            await bcrypt.hash(
                refreshToken,
                10,
            );
        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                refresh_token_hash:
                    refreshTokenHash,
            },
        });
        return {
            success: true,
            access_token: accessToken,


            refresh_token: refreshToken,
        };
    }
    async logout(userId: number) {
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                refresh_token_hash: null,
                session_expires_at: null,
            },
        });

        return {
            success: true,
            message: 'Logged out successfully',
        };
    }
}