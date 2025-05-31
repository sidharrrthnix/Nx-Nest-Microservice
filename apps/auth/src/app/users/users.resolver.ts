import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorators';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guards';
import { TokenPayload } from '../auth/token-payload.interface';
import { CreateUserInput } from './dto/create-user.input.dto';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.createUser(createUserInput);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User], { name: 'users' })
  async getUsers(@CurrentUser() user: TokenPayload) {
    console.log(user);
    return this.usersService.getUsers();
  }
}
