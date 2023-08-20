class UserDto {
  constructor(user) {
    this.id = user._id;
    this.email = user.email;
    this.name = user.name;
    this.isEmailVerified = user.isEmailVerified;
  }
}

module.exports = UserDto;
