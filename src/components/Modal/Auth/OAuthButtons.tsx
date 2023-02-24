import { Image, Button, Flex, Text } from "@chakra-ui/react";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/clientApp";
import { User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect } from "react";

const OAuthButtons: React.FC = () => {
  const [signInWithGoogle, userCred, loading, error] =
    useSignInWithGoogle(auth);
  const createUserDoc = async (user: any) => {
    const userDocRef = doc(firestore, "users", user.uid);
    console.log(userCred);
    await setDoc(userDocRef, JSON.parse(JSON.stringify(user)));
  };

  useEffect(() => {
    if (userCred) {
      createUserDoc(userCred.user);
    }
  }, [userCred]);

  return (
    <Flex direction="column" width="100%" mb={4}>
      <Button
        variant="oauth"
        mb={2}
        color="gray.800"
        isLoading={loading}
        onClick={() => signInWithGoogle()}
      >
        <Image src="/images/googlelogo.png" height="20px" mr={4} alt="google" />
        Continue with Google
      </Button>
      <Button color="gray.800" variant="oauth">
        Some other Provider
      </Button>
      {error && (
        <Text textAlign="center" color="red" fontSize="10pt">
          {error?.message}
        </Text>
      )}
    </Flex>
  );
};
export default OAuthButtons;
