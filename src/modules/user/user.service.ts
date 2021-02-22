import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { exception } from 'console';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { RegsiterUserDto, UpdateUserDto } from '../auth';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['userId', 'name', 'email', 'isActive', 'created'],
    });
  }

  async create(registerUserPayloadDto: RegsiterUserDto): Promise<User> {
    const { userId } = registerUserPayloadDto;
    if (this.findOneByUserId(userId)) {
      throw new BadRequestException(`Not found ${userId} user`);
    }
    return await this.userRepository.save(registerUserPayloadDto);
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`Not found ${id} user`);
    }
    return user;
  }

  async findOneByUserId(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`Not found ${userId} user`);
    }
    return user;
  }

  async remove(id: number): Promise<DeleteResult> {
    await this.findOneById(id);
    return await this.userRepository.delete(id);
  }

  async update(
    userId: string,
    updateUserPayloadDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    await this.findOneByUserId(userId);
    return await this.userRepository.update(userId, updateUserPayloadDto);
  }
}
