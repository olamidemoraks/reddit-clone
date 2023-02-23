import {
  Text,
  Modal,
  ModalContent,
  ModalHeader,
  Flex,
  ModalBody,
  ModalOverlay,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { authModalState } from "@/atoms/authModalAtoms";
import AuthInput from "./AuthInput";
import OAuthButtons from "./OAuthButtons";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";
import ResetPassword from "./ResetPassword";

const AuthModal: React.FC = () => {
  const [modalState, setModalState] = useRecoilState(authModalState);
  const [user, loading, error] = useAuthState(auth);
  const handleClose = () => {
    setModalState((prev) => ({
      ...prev,
      open: false,
    }));
  };
  useEffect(() => {
    if (user) {
      handleClose();
      console.log(user);
    }
  }, [user]);

  return (
    <>
      <Modal isOpen={modalState.open} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalHeader textAlign="center" color="black">
            {modalState.view === "login" && "Login"}
            {modalState.view === "signup" && "Sign Up"}
            {modalState.view === "resetPassword" && "Reset Password"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            pb={6}
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              width="70%"
            >
              {modalState.view === "login" || modalState.view === "signup" ? (
                <>
                  <OAuthButtons />
                  <Text color="gray.500" fontWeight={700}>
                    OR
                  </Text>
                  <AuthInput />
                </>
              ) : (
                <ResetPassword />
              )}
              {/* forgot password */}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export default AuthModal;
