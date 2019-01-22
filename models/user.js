const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mailer = require("@sendgrid/mail");
const crypto = require("crypto");

mailer.setApiKey(process.env.SENDGRID);

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: "US"
  },
  privilege: {
    type: Number,
    default: 0
  },
  flag: {
    type: String
  },
  tempToken: {
    type: String
  },
  tempTokenExpiry: {
    type: Date
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post"
    }
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

userSchema.methods.sendConfirmEmail = function() {
  return crypto.randomBytes(32, async (err, bufferResult) => {
    if (err) {
      Promise.reject("Could not generate token.");
    } else {
      const token = bufferResult.toString("hex");
      this.tempToken = token;
      await this.save();
      mailer.send({
        to: this.email,
        from: "noreply@wiakc.org",
        subject: "WIA-KC: Confirm Your Account",
        html: `
            <p>Welcome to the West Indian Association of Greater Kansas City!</p>
            <p>Click this <a href="https://wiakc.org/account/confirm/?token=${token}">link</a> to confirm your email.</p>
            <p>Thank you for being part of our community.</p>`
      });
    }
  });
};

userSchema.methods.sendResetPasswordEmail = function() {
  return crypto.randomBytes(32, async (err, bufferResult) => {
    if (err) {
      Promise.reject("Could not generate token.");
    } else {
      const token = bufferResult.toString("hex");
      this.tempToken = token;
      this.tempTokenExpiration = Date.now() + 3600000;
      await this.save();
      mailer.send({
        to: this.email,
        from: "noreply@wiakc.org",
        subject: "WIA-KC: Reset Password Request",
        html: `
            <p>You requested a password reset.</p>
            <p>Click this <a href="https://wiakc.org/account/reset/?token=${token}">link</a> to set a new password.</p>
            <p>Thank you for being part of our community.</p>`
      });
    }
  });
};

module.exports = mongoose.model("User", userSchema);
