import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const CLIENT_ID = process.env.COGNITO_CLIENT_ID || "";
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || "";

export const cognitoSignIn = async (email: string, password: string) => {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  const response = await client.send(command);
  return response.AuthenticationResult;
};

export const cognitoSignUp = async (email: string, password: string, name: string, role: string = "STUDENT") => {
  const command = new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: name },
      { Name: "custom:role", Value: role },
    ],
  });

  const response = await client.send(command);
  return response.UserConfirmed;
};

export const cognitoForgotPassword = async (email: string) => {
  const command = new ForgotPasswordCommand({
    ClientId: CLIENT_ID,
    Username: email,
  });

  await client.send(command);
};

export const cognitoConfirmForgotPassword = async (email: string, code: string, newPassword: string) => {
  const command = new ConfirmForgotPasswordCommand({
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
  });

  await client.send(command);
};
