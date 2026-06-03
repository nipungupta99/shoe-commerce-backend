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

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        console.log('Signing token with payload:', payload);
        const accessToken = await this.jwtService.signAsync(payload);
        console.log('Token signed successfully');

        return {
            success: true,
            message: 'Login successful',
            access_token: accessToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        };
    }
}