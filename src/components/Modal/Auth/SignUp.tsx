import { useState, useEffect } from "react";
import { Input, Button, Flex, Text } from "@chakra-ui/react";
import { useSetRecoilState } from "recoil";
import { authModalState } from "@/atoms/authModalAtoms";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/clientApp";
import { FIREBASE_ERROR } from "@/firebase/error";
import { User } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";

const SignUp: React.FC = () => {
  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    confirmpassword: "",
  });
  const [error, setError] = useState("");
  const setAuthModalState = useSetRecoilState(authModalState);
  const [createUserWithEmailAndPassword, userCred, loading, userError] =
    useCreateUserWithEmailAndPassword(auth);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (error) setError("");
    if (signupForm.password !== signupForm.confirmpassword) {
      setError("Password do not match");
      return;
    }
    console.log(userCred);
    createUserWithEmailAndPassword(signupForm.email, signupForm.password);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSignupForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const createUserDocument = async (user: any) => {
    await addDoc(
      collection(firestore, "users"),
      JSON.parse(JSON.stringify(user))
    );
  };

  useEffect(() => {
    if (userCred) {
      createUserDocument(userCred?.user);
    }
  }, [userCred]);

  return (
    <form onSubmit={onSubmit}>
      <Input
        color="gray.800"
        required
        name="email"
        placeholder="email"
        type="email"
        mb={2}
        onChange={onChange}
        _placeholder={{ color: "gray.500" }}
        fontSize="10pt"
        _hover={{
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500",
        }}
        _focus={{
          outline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500",
        }}
        bg="gray.50"
      />
      <Input
        color="gray.800"
        required
        name="password"
        placeholder="password"
        type="password"
        onChange={onChange}
        mb={2}
        _placeholder={{ color: "gray.500" }}
        fontSize="10pt"
        _hover={{
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500",
        }}
        _focus={{
          outline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500",
        }}
        bg="gray.50"
      />
      <Input
        color="gray.800"
        required
        name="confirmpassword"
        placeholder="confirm password"
        type="password"
        onChange={onChange}
        mb={2}
        _placeholder={{ color: "gray.500" }}
        fontSize="10pt"
        _hover={{
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500",
        }}
        _focus={{
          outline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500",
        }}
        bg="gray.50"
      />

      <Text textAlign="center" color="red" fontSize="10pt">
        {error ||
          FIREBASE_ERROR[userError?.message as keyof typeof FIREBASE_ERROR]}
      </Text>

      <Button
        width="100%"
        height="36px"
        mt={2}
        mb={2}
        type="submit"
        isLoading={loading}
      >
        Sign Up
      </Button>
      <Flex fontSize="9pt" justifyContent="center">
        <Text mr={1}>Already a redidtor?</Text>
        <Text
          color="blue.500"
          fontWeight={700}
          cursor="pointer"
          onClick={() => setAuthModalState({ open: true, view: "login" })}
        >
          LOG IN
        </Text>
      </Flex>
    </form>
  );
};
export default SignUp;
