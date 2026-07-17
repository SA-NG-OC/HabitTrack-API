import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CheckInsService } from './checkins.service';
import { CreateCheckInDto } from './dto/create-checkin.dto';
import { ApiCreateCheckInDocs } from './decorators/create-checkin-swagger.decorator';
import { ApiGetCheckInsDocs } from './decorators/get-checkins-swagger.decorator';
import { ApiDeleteCheckInDocs } from './decorators/delete-checkin-swagger.decorator';

@ApiTags('Check-ins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('habits/:id/checkins')
export class CheckInsController {
  constructor(private readonly checkinsService: CheckInsService) {}

  @Post()
  @ApiCreateCheckInDocs()
  async create(
    @CurrentUser() user: any,
    @Param('id') habitId: string,
    @Body() dto: CreateCheckInDto,
  ) {
    return this.checkinsService.create(user.id, habitId, dto);
  }

  @Get()
  @ApiGetCheckInsDocs()
  async findAll(@CurrentUser() user: any, @Param('id') habitId: string) {
    return this.checkinsService.findAll(user.id, habitId);
  }

  @Delete(':checkInId')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteCheckInDocs()
  async remove(
    @CurrentUser() user: any,
    @Param('id') habitId: string,
    @Param('checkInId') checkInId: string,
  ) {
    return this.checkinsService.remove(user.id, habitId, checkInId);
  }
}
