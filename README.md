<img src="https://socialify.git.ci/juniorSarh/Shopping-List-App/image?language=1&owner=1&name=1&stargazers=1&theme=Light" alt="Shopping-List-App" width="640" height="320" />

Shopping Lists — React + Redux + JSON Server

A responsive shopping list app with authentication, protected routes, profile management, list + item CRUD, shareable lists, and URL-driven search/sort. Built with React, TypeScript, Redux Toolkit, React Router v6, Vite, and json-server.

✨ Features

Auth (Register + Login)

Register with email, password, name, surname, cell number

Passwords hashed on signup and verified on login (bcryptjs)

Protected routes: guests see Home/Login/SignUp, authed users see Dashboard/Profile

Profile

View & edit profile, update credentials

Shopping Lists

Create multiple lists (title, optional category/image/notes stored with the list)

Responsive card grid: 1 column (mobile) → 2 (tablet) → 4 (desktop)

Card shows meta (counts, notes), does not hide itself; only items are hidden

“View Items” opens a full-page/overlay items view

Share a list (Web Share API with clipboard fallback)

Items

Add, edit, delete items with name, quantity, category, notes, images

Toggle purchased state (if included in your slice)

URL search for items by name: ?q=milk

(Hooks for sorting via URL ready; see URL Contract below)

State Management

Two slices: shoppingLists and items (clean separation)

Persistence

json-server backend for users, lists, items

🧱 Project Structure (key parts)
src/
  features/
    auth/
      loginSlice.ts            # login + (optionally registration) thunks/selectors
    lists/
      shoppingListsSlice.ts    # list CRUD + selectors
    items/
      itemsSlice.ts            # item CRUD + selectors
    registerSlice.ts           # (optional) separate register slice if you use it
  modules.css/
      shoppinglist.module.css
      shoppinglistdetails.module.css
      itemsOverlay.module.css
      itemsTable.module.css
  pages/
    Home.tsx
    LogIn.tsx
    SignUp.tsx
    Dashboard.tsx              # lists grid, nested routes
    Profile.tsx
    ItemsOverlay.tsx           # full-page/overlay items table with search
  components/
    ShoppinglistDetails.tsx    # a single list "card" UI with modals
  routes/
    ProtectedRoute.tsx
  store.ts
  App.tsx


Note: Use the features/lists/shoppingListsSlice.ts + features/items/itemsSlice.ts paths consistently. Remove older files like shoppinglistSlice.ts (singular) to avoid import mismatches.

🔌 API & Data (json-server)

Create a db.json in project root:

{
  "users": [],
  "lists": [],
  "items": []
}


Typical records:

// users
{
  "id": "uuid-or-number",
  "email": "alice@example.com",
  "passwordHash": "$2a$10$...",
  "name": "Alice",
  "surname": "Smith",
  "cellNumber": "0123456789"
}

// lists
{
  "id": "list-1",
  "userId": "uuid-of-user",
  "title": "Groceries",
  "category": "Groceries",
  "imageUrl": "https://...",
  "notes": "Saturday shop",
  "createdAt": 1728600000000
}

// items
{
  "id": "item-1",
  "listId": "list-1",
  "name": "Milk",
  "quantity": 2,
  "category": "Dairy",
  "notes": "",
  "images": ["https://..."],
  "createdAt": 1728601000000
}


Endpoints (json-server):

GET /users?email=alice@example.com

POST /users

GET /lists?userId=<uid>

POST /lists, PATCH /lists/:id, DELETE /lists/:id

GET /items?listId=<listId>

POST /items, PATCH /items/:id, DELETE /items/:id

⚙️ Setup
1) Install dependencies
npm i

2) Environment

Create .env (or .env.local) in project root:

VITE_API_URL=http://localhost:3000

3) Start json-server
npx json-server --watch db.json --port 3000 --delay 400


The delay is optional, but helps you see loading states.

4) Start the app
npm run dev


Vite dev server prints the local URL (usually http://localhost:5173).

Open in the browser.

5) Build (optional)
npm run build
npm run preview

🔐 Authentication Overview

Registration: hashes password with bcryptjs before saving to /users as passwordHash.

Login: fetch user by email, compare typed password with passwordHash using bcryptjs.compare.

Protected routes:

GuestRoute: redirects authed users away from /, /login, /signup to /dashboard

PrivateRoute: redirects unauthenticated users to /login

This is a client-side demo. Do not use json-server + client hashing in production.

🧭 Routing
// App.tsx (simplified)
<Routes>
  <Route element={<GuestRoute />}>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<LogIn />} />
    <Route path="/signup" element={<SignUp />} />
  </Route>

  <Route element={<PrivateRoute />}>
    <Route path="/dashboard" element={<Dashboard />}>
      <Route path="lists/:listId/items" element={<ItemsOverlay />} />
      {/* so /dashboard/lists/:id/items shows overlay */}
    </Route>
    <Route path="/profile" element={<Profile />} />
  </Route>

  <Route path="*" element={<Home />} />
</Routes>


Dashboard shows list cards in a responsive grid.

Each card’s “view Items” link goes to lists/:id/items (relative), which renders ItemsOverlay inside the dashboard and visually hides other dashboard content.

Profile is accessible at /profile (and you can add /dashboard/profile as an alias if desired).

🔍 URL Contract (search/sort)

ItemsOverlay reads query params:

q — search term (by item name), e.g.
/dashboard/lists/abc/items?q=milk

Sorting (optional; scaffold present for extension):

sort — name | category | date

order — asc | desc

Example:
/dashboard/lists/abc/items?sort=name&order=asc

You can wire sort + order into the memo that currently filters by q.

🧩 Slices & Selectors
Lists (features/lists/shoppingListsSlice.ts)

fetchShoppingListsByUser(userId)

createShoppingList({ userId, title, ...optionalMeta })

updateShoppingList({ listId, changes })

deleteShoppingList(listId)

Selectors:

selectShoppingListsByUser(userId)

selectShoppingListById(id)

selectListsStatus, selectListsError

Items (features/items/itemsSlice.ts)

fetchItemsByList({ listId })

addItemToList({ listId, name, quantity, category?, notes?, images? })

updateListItem({ listId, itemId, changes })

deleteListItem({ listId, itemId })

Selectors:

selectItemsByListId(listId)

selectItemsStatus, selectItemsError

Auth (features/auth/loginSlice.ts)

registerUser({ email, password, name, surname, phone }) (or use a separate registerSlice if you prefer)

loginUser({ email, password }), logout(), hydrate(user)

Selectors: selectCurrentUser, selectAuthStatus, selectAuthError

If you keep a separate features/registerSlice.ts, add it to the store and use its own selectors. Otherwise, put registration into loginSlice and remove the separate slice.

🧰 Store
// src/store.ts
export const store = configureStore({
  reducer: {
    login: loginReducer,
    shoppingLists: shoppingListsReducer,
    items: itemsReducer,
    // register: registerReducer, // only if you keep a separate register slice
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

🎨 UI & Styling

Cards grid: add cardGrid to the <ul> that wraps cards:

<ul className={`${styles.list} ${styles.cardGrid}`}>
  <li className={styles.card}><ShoppingListDetail listId={...} /></li>
  ...
</ul>


Modals: both “Add List” and “Add Item” are centered pop-ups with a semi-transparent overlay.

ItemsOverlay: Displays a table of items and a topbar with search, Add, Close.