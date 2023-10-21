class UsersController < ApplicationController
    def index
      @users = [
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Doe', email: 'jane@example.com' }
      ]
      render json: @users
    end
  end