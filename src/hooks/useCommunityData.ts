import { authModalState } from "@/atoms/authModalAtoms";
import {
  Community,
  CommunitySnippets,
  communityState,
} from "@/atoms/communitiesAtoms";
import { auth, firestore } from "@/firebase/clientApp";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  writeBatch,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";

const useCommunityData = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);
  const setAuthModalState = useSetRecoilState(authModalState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    // is the user sign in?
    // if not => open auth modal!
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
    }
    setLoading(true);
    if (isJoined) {
      leaveCommunity(communityData.id);
      return;
    }
    joinCommunity(communityData);
  };

  const getMySnippet = async () => {
    setLoading(true);
    try {
      const userRef = collection(
        firestore,
        `users/${user?.uid}/communitySnippets`
      );
      const snippetDocs = await getDocs(userRef);
      const snippet = snippetDocs.docs.map((doc) => ({ ...doc.data() }));
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippet as CommunitySnippets[],
        snippetFetched: true,
      }));
      console.log(snippet);
    } catch (error: any) {
      console.log("getMySnippets error", error);
      setError(error?.message);
    }
    setLoading(false);
  };

  const joinCommunity = async (communityData: Community) => {
    try {
      const batch = writeBatch(firestore);

      const newSnippet: CommunitySnippets = {
        communnityId: communityData.id,
        imageUrl: communityData.imageUrl || "",
        isModerator: user?.uid === communityData.creatorId,
      };

      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          communityData.id
        ),
        newSnippet
      );

      batch.update(doc(firestore, "communities", communityData.id), {
        numberOfMember: increment(1),
      });

      await batch.commit();
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [...prev.mySnippets, newSnippet],
      }));
      console.log("join community");
    } catch (error: any) {
      console.log("joinCommunity error", error);
      setError(error?.message);
    }
    setLoading(false);
  };

  //NOT WORKING
  const leaveCommunity = async (communityId: string) => {
    console.log(communityId);
    try {
      const batch = writeBatch(firestore);

      batch.delete(
        doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
      );
      batch.update(doc(firestore, "communities", communityId), {
        numberOfMember: increment(-1),
      });

      await batch.commit();

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (item) => item.communnityId !== communityId
        ),
      }));
    } catch (error: any) {
      console.log("removeCommunity error", error.message);
      setError(error?.message);
    }
    setLoading(false);
  };

  const fetchCommunity = async (communityId: string) => {
    try {
      const communityRef = doc(firestore, "communities", communityId);
      const communityDoc = await getDoc(communityRef);
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          id: communityDoc.id,
          ...communityDoc.data(),
        } as Community,
      }));
    } catch (error) {
      console.log("fetchCommunity error", error);
    }
  };
  useEffect(() => {
    const { communityId } = router.query;
    if (!communityStateValue.currentCommunity && communityId) {
      fetchCommunity(communityId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query, communityStateValue.currentCommunity]);

  useEffect(() => {
    if (!user) {
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [],
        snippetFetched: false,
      }));
      return;
    }
    getMySnippet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    communityStateValue,
    onJoinOrLeaveCommunity,
    loading,
  };
};

export default useCommunityData;
