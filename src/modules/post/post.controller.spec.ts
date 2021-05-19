import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/decorators';
import { PostController, PostService } from '.';
import { UserEntity, UserService } from '../user';
import { CreatePostDto } from './dto/create-post.dto';
import { PostEntity } from './post.entity';

const testUser: UserEntity = {
  id: 1,
  name: 'test',
  email: 'test@test.com',
  password: '12345678',
  userId: 'test',
  createdAt: new Date(),
  isActive: true,
};

const testPostEntity: PostEntity = {
  content: 'content',
  id: 1,
  title: 'title',
  user: testUser,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PostController', () => {
  let postController: PostController;
  let userSerivce: UserService;
  let postService: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findOneByUserId: jest.fn((id) => {
              return { ...testUser, id };
            }),
          },
        },
        {
          provide: PostService,
          useValue: {
            findAll: jest.fn(() => [testPostEntity]),
            findOneByPostId: jest.fn((id: number) => {
              return { ...testPostEntity, id };
            }),
            create: jest.fn(() => {
              return testPostEntity;
            }),
            delete: jest.fn(() => {}),
            update: jest.fn(({ content, title }: CreatePostDto, id: number) => {
              return { ...testPostEntity, id, content, title };
            }),
            validatePostUser: jest.fn(() => true),
          },
        },
      ],
    }).compile();

    postController = module.get<PostController>(PostController);
    userSerivce = module.get<UserService>(UserService);
    postService = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(postController).toBeDefined();
  });

  it('should create a post', async () => {
    const user: User = { userId: '1', username: 'userName' };
    const createPostDto: CreatePostDto = { content: 'content', title: 'title' };

    const response = (await postController.createPost(
      user,
      createPostDto,
    )) as any;

    expect(response.id).toEqual(1);
  });

  it('should throw NotFoundException', async () => {
    const user: User = { userId: '1', username: 'userName' };
    const createPostDto: CreatePostDto = { content: 'content', title: 'title' };

    try {
      userSerivce.findOneByUserId = jest.fn((id) => undefined);
      await postController.createPost(user, createPostDto);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
    }
  });

  it('should get posts', async () => {
    const response = await postController.getPosts();

    expect(response.length).toBeGreaterThan(0);
  });

  it('should get a post', async () => {
    const postId = 1;
    const response = await postController.getPost(postId);

    expect(response.id).toEqual(postId);
  });

  it('should update a post', async () => {
    const user: User = { userId: '1', username: 'userName' };
    const createPostDto: CreatePostDto = { content: 'create', title: 'create' };
    const updatePostDto: CreatePostDto = {
      content: 'updated',
      title: 'updated',
    };
    const postId = 1;

    await postController.createPost(user, createPostDto);
    const response = (await postController.updatePost(
      user,
      postId,
      updatePostDto,
    )) as any;

    expect(response.content).toEqual(updatePostDto.content);
  });

  it('should delete a post', async () => {
    const user: User = { userId: '1', username: 'userName' };
    const createPostDto: CreatePostDto = { content: 'create', title: 'create' };
    const postId = 1;

    await postController.createPost(user, createPostDto);
    await postController.deletePost(user, postId);
    postService.findAll = jest.fn(async () => []);

    const response = await postController.getPosts();
    expect(response.length).toEqual(0);
  });
});
