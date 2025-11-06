import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard ini akan memanggil JwtStrategy secara otomatis
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}