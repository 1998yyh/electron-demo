import { useChatStore } from "./useChatStore";
import {useMessageStore} from './useMessageStore'

export function useStore() {
	const chatStore = useChatStore();
	const messageStore = useMessageStore();

	return {
		chatStore,
		messageStore
	};
}
