import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

export interface Community {
  id: string;
  creatorId: string;
  numberOfMember: number;
  privacyType: "public" | "private" | "restricted";
  createdAt?: Timestamp;
  imageUrl?: string;
}
export interface CommunitySnippets {
  communnityId: string;
  isModerator?: boolean;
  imageUrl?: string;
}

interface CommunityState {
  mySnippets: CommunitySnippets[];
  currentCommunity?: Community;
  snippetFetched: boolean;
  modal: boolean;
}

const defaultCommunityState: CommunityState = {
  mySnippets: [],
  snippetFetched: false,
  modal: false,
};

export const communityState = atom<CommunityState>({
  key: "communitiesState",
  default: defaultCommunityState,
});
