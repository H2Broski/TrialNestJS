import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Param, 
    Body, 
    UseGuards, 
    HttpCode, 
    HttpStatus, 
    Req, 
    UnauthorizedException 
} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { JwtAuthGuard } from '../auth/jwt.auth-guard';

interface PositionCreateDto {
    position_code: string;
    position_name: string;
}
interface PositionUpdateDto {
    position_code?: string;
    position_name?: string;
}

@Controller('positions')
@UseGuards(JwtAuthGuard)
export class PositionsController {
    constructor(private readonly positionsService: PositionsService) {}

    @Get()
    async getAll() {
        return this.positionsService.getAll();
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.positionsService.getOne(Number(id));
    }

    @Post()
    async create(@Req() req: any, @Body() body: PositionCreateDto) {
        const userId = req.user?.id ?? req.user?.sub;
        if (!userId) throw new UnauthorizedException('Missing user id in token');
        return this.positionsService.create(body, Number(userId));
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Req() req: any, @Param('id') id: string, @Body() body: PositionUpdateDto) {
        const userId = req.user?.id ?? req.user?.sub;
        if (!userId) throw new UnauthorizedException('Missing user id in token');
        const updated = await this.positionsService.update(Number(id), body, Number(userId));
        return { message: 'Position updated successfully', data: updated };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Req() req: any, @Param('id') id: string) {
        const userId = req.user?.id ?? req.user?.sub;
        await this.positionsService.remove(Number(id), Number(userId));
        return { message: 'Position deleted successfully' };
    }
}