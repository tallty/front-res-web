import { injectMultiTabStore } from '../../multi-tab/multi-tab-store';
import { useRoute, useRouter } from 'vue-router';

const useNavigateTab = () => {
  const store = injectMultiTabStore();

  const updateTitle = (title: string, route: string) => {
    store.cacheList.find(tab => tab.path === route)!.route.meta.title = title;
  };

  const route = useRoute();
  const router = useRouter();

  const closeCurrentTabAndNavigateTo = (to: string) => {
    const currentIndex = store.cacheList.findIndex(tab => tab.path === route.fullPath);

    router.push(to).then(() => {
      if (currentIndex > -1) {
        store.cacheList.splice(currentIndex, 1);
      }
    });
  };

  return {
    updateTitle,
    closeCurrentTabAndNavigateTo,
  };
};

export default useNavigateTab;
