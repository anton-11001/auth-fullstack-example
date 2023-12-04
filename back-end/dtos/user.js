class UserDto {
  constructor(user) {
    this.id = user._id.toString();
    this.email = user.email;
    this.name = user.name;
    this.isEmailVerified = user.isEmailVerified;
  }
}

module.exports = UserDto;
