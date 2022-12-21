import { useChatStore } from "./useChatStore";

export function useStore() {
	const chatStore = useChatStore();

	return {
		chatStore,
	};
}
