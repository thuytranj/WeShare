---
name: weshare-frontend
description: >-
  Expert guide and runbook for developing, refactoring, and styling the WeShare React frontend.
  Use whenever building or editing React components, Tailwind CSS styles, Zustand stores,
  TanStack Query hooks, Socket.io real-time listeners, media upload workflows, or responsive layouts.
---

# WeShare Frontend Engineering Skill

This skill enforces high-standard modern web development practices for the **WeShare Frontend** built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, **TanStack Query (React Query v5)**, **Zustand**, and **Socket.io Client**.

---

## 1. Architecture & Directory Conventions

Code is organized by **Feature-Based Architecture**:

```
frontend/src/
├── components/
│   ├── ui/                      # Reusable primitives: Button, Input, Modal, Avatar, Skeleton, Dropdown
│   └── shared/                  # Composite shared widgets: Navbar, Sidebar, PostCard, CommentItem
├── features/                    # Feature domain modules
│   ├── auth/                    # LoginForm, RegisterForm, OtpVerifyModal
│   ├── feed/                    # FeedTimeline, CreatePostBox, StoryBar
│   ├── posts/                   # PostDetailModal, MediaGallery, ReactionPicker
│   ├── chat/                    # ChatWindow, MessageBubble, TypingIndicator
│   └── profile/                 # ProfileHeader, EditProfileDialog, FriendsTab
├── hooks/                       # Generic hooks (useDebounce, useIntersectionObserver)
├── layouts/                     # AppLayout, AuthLayout, ChatLayout, AdminLayout
├── routes/                      # AppRouter, ProtectedRoute, PublicRoute
├── services/                    # Axios API client & Socket.io singleton
│   ├── api.client.ts            # Auto-refreshes JWT on 401 response
│   └── socket.client.ts         # Socket.io connection manager
├── stores/                      # Zustand state management (auth.store, chat.store)
└── types/                       # Shared TypeScript interfaces
```

---

## 2. Server State vs Client State Guidelines

1. **Server State (TanStack Query v5)**:
   - All REST API calls (posts, feeds, user profiles, comments, notifications) must use TanStack Query hooks (`useQuery`, `useMutation`, `useInfiniteQuery`).
   - Do **NOT** duplicate server state into Zustand stores or local `useState`.
   - **Query Keys**: Use consistent array factories:
     ```typescript
     export const postKeys = {
       all: ['posts'] as const,
       lists: () => [...postKeys.all, 'list'] as const,
       list: (filter: string) => [...postKeys.lists(), { filter }] as const,
       detail: (id: string) => [...postKeys.all, 'detail', id] as const,
     };
     ```
2. **Client Global State (Zustand)**:
   - Use Zustand strictly for UI and session state:
     - Current authenticated user (`user`, `isAuthenticated`, `logout`)
     - Active chat conversation (`activeConversationId`)
     - Global modals (`isCreatePostOpen`, `openCreatePost()`)
     - Theme state (`dark` / `light`)

---

## 3. Real-Time Interaction & Optimistic Updates

### Optimistic UI for Reactions & Comments
Users must experience instant gratification when pressing "Like" or posting a comment:
```typescript
export function useToggleReaction(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reactionType: string) => postsApi.react(postId, reactionType),
    onMutate: async (newReaction) => {
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });
      const previousPost = queryClient.getQueryData<Post>(postKeys.detail(postId));

      queryClient.setQueryData<Post>(postKeys.detail(postId), (old) => {
        if (!old) return old;
        return {
          ...old,
          isReacted: true,
          myReaction: newReaction,
          reactionCount: old.isReacted ? old.reactionCount : old.reactionCount + 1,
        };
      });

      return { previousPost };
    },
    onError: (_err, _newReaction, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
  });
}
```

---

## 4. Media Upload & Client-Side Canvas Thumbnail Generation

For video uploads:
1. Video file is kept on the client.
2. An HTML5 `<canvas>` extracts frame 0 at $t = 0.5\text{s}$ as a JPEG poster image.
3. Client requests two presigned URLs from backend: one for the video, one for the poster thumbnail.
4. Client uploads both directly to Supabase S3 bucket using HTTP `PUT`.
5. Client sends the resulting URLs to create the post.

---

## 5. UI/UX & Tailwind CSS Rules

1. **Design System & Spacing**:
   - Primary brand color: Indigo/Violet gradient (`from-indigo-600 to-violet-600`).
   - Clean card design with smooth borders (`border border-slate-200 dark:border-slate-800 rounded-2xl`).
   - Skeletons: Always show animated skeleton loaders (`animate-pulse`) while fetching feed or messages.
2. **Icons**: Use `lucide-react` exclusively (e.g., `<Heart />`, `<MessageCircle />`, `<Share2 />`, `<Bookmark />`, `<Pin />`).
3. **Accessibility**:
   - Interactive elements must have proper focus states (`focus-visible:ring-2 focus-visible:ring-indigo-500`).
   - Buttons must have `aria-label` when containing only icons.

---

## 6. Verification Commands

```bash
# 1. Type check
cd frontend && npm run build

# 2. Lint check
npm run lint
```
