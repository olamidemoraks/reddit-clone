import React from "react";
import { Flex } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { authModalState } from "@/atoms/authModalAtoms";
import Login from "./Login";
import SignUp from "./SignUp";

type AuthInputProps = {};

const AuthInput: React.FC<AuthInputProps> = () => {
  const modelState = useRecoilValue(authModalState);
  return (
    <Flex direction="column" align="center" width="100%" mt={4}>
      {modelState.view === "login" && <Login />}
      {modelState.view === "signup" && <SignUp />}
    </Flex>
  );
};
export default AuthInput;
