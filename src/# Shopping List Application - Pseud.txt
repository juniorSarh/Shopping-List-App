# Shopping List Application - Pseudocode

## 1. APPLICATION ENTRY POINT (App.tsx)

```
FUNCTION App():
    RETURN (
        Redux Provider with store
        Router with routing configuration
        AppContent component
    )

FUNCTION AppContent():
    INITIALIZE dispatch from Redux
    GET authentication state from Redux store
    
    ON component mount:
        CALL initializeAuth() to restore user session
    
    RETURN (
        Application shell with:
            - Navbar component
            - Main content area with routes:
                * Public routes (login, register)
                * Protected routes (home, profile, list details)
                * Catch-all redirect
            - Toast notification system
    )
```

## 2. AUTHENTICATION SYSTEM

### Auth Store Slice (authSlice.ts)
```
DEFINE AuthState:
    - user: User object or null
    - isAuthenticated: boolean
    - isLoading: boolean
    - error: string or null

DEFINE Initial State:
    - user: null
    - isAuthenticated: false
    - isLoading: false
    - error: null

AUTH ACTIONS:
    
    initializeAuth():
        SET isLoading = true
        GET stored token from localStorage
        IF token exists:
            VALIDATE token
            IF valid:
                SET user data and isAuthenticated = true
            ELSE:
                CLEAR invalid token
        SET isLoading = false
    
    loginUser(credentials):
        SET isLoading = true
        CALL login API with encrypted credentials
        IF success:
            STORE token in localStorage
            SET user data and isAuthenticated = true
            CLEAR any errors
        ELSE:
            SET error message
        SET isLoading = false
    
    registerUser(userData):
        SET isLoading = true
        HASH password with encryption
        CALL register API with user data
        IF success:
            STORE token in localStorage
            SET user data and isAuthenticated = true
        ELSE:
            SET error message
        SET isLoading = false
    
    logoutUser():
        REMOVE token from localStorage
        RESET state to initial values
        REDIRECT to login page
    
    updateProfile(profileData):
        SET isLoading = true
        CALL update profile API
        IF success:
            UPDATE user data in state
        ELSE:
            SET error message
        SET isLoading = false
```

### Protected Route Component
```
FUNCTION ProtectedRoute(children, requireAuth = true):
    GET authentication state from Redux
    
    IF requireAuth is true:
        IF user is authenticated:
            RENDER children
        ELSE:
            REDIRECT to login page
    ELSE:
        IF user is NOT authenticated:
            RENDER children
        ELSE:
            REDIRECT to home page
```

### Authentication Forms
```
FUNCTION LoginForm():
    INITIALIZE form state (email, password)
    GET auth state and dispatch from Redux
    
    ON form submit:
        VALIDATE input fields
        IF valid:
            DISPATCH loginUser action with credentials
        ELSE:
            SHOW validation errors
    
    RENDER:
        Form with email and password inputs
        Submit button
        Link to register page
        Loading state indicator

FUNCTION RegisterForm():
    INITIALIZE form state (username, email, password, confirmPassword)
    GET auth state and dispatch from Redux
    
    ON form submit:
        VALIDATE all fields
        CHECK password confirmation match
        IF valid:
            DISPATCH registerUser action
        ELSE:
            SHOW validation errors
    
    RENDER:
        Form with all registration fields
        Submit button
        Link to login page
        Loading state indicator
```

## 3. SHOPPING LIST STATE MANAGEMENT

### Shopping List Store Slice
```
DEFINE ShoppingListState:
    - lists: Array of ShoppingList objects
    - currentList: ShoppingList or null
    - items: Array of ShoppingItem objects
    - isLoading: boolean
    - error: string or null
    - searchQuery: string
    - sortBy: string
    - filterCategory: string

SHOPPING LIST ACTIONS:

    fetchShoppingLists():
        SET isLoading = true
        CALL API to get user's shopping lists
        IF success:
            SET lists array
        ELSE:
            SET error message
        SET isLoading = false
    
    createShoppingList(listData):
        SET isLoading = true
        CALL API to create new list
        IF success:
            ADD new list to lists array
            SHOW success toast
        ELSE:
            SET error message
        SET isLoading = false
    
    updateShoppingList(listId, updateData):
        SET isLoading = true
        CALL API to update list
        IF success:
            UPDATE list in lists array
            IF current list, UPDATE currentList
        ELSE:
            SET error message
        SET isLoading = false
    
    deleteShoppingList(listId):
        SET isLoading = true
        CALL API to delete list
        IF success:
            REMOVE list from lists array
            IF was current list, CLEAR currentList
        ELSE:
            SET error message
        SET isLoading = false
    
    fetchShoppingListItems(listId):
        SET isLoading = true
        CALL API to get list items
        IF success:
            SET items array
            SET currentList
        ELSE:
            SET error message
        SET isLoading = false
    
    addShoppingItem(listId, itemData):
        CALL API to add item
        IF success:
            ADD item to items array
            SHOW success toast
        ELSE:
            SET error message
    
    updateShoppingItem(itemId, updateData):
        CALL API to update item
        IF success:
            UPDATE item in items array
        ELSE:
            SET error message
    
    deleteShoppingItem(itemId):
        CALL API to delete item
        IF success:
            REMOVE item from items array
        ELSE:
            SET error message
    
    setSearchQuery(query):
        SET searchQuery = query
        UPDATE URL parameters
    
    setSortBy(sortOption):
        SET sortBy = sortOption
        UPDATE URL parameters
    
    setFilterCategory(category):
        SET filterCategory = category
        UPDATE URL parameters
```

## 4. USER INTERFACE COMPONENTS

### Navigation Bar
```
FUNCTION Navbar():
    GET authentication state from Redux
    GET current user from Redux
    
    IF user is authenticated:
        RENDER:
            App logo/title
            Navigation links (Home, Profile)
            User avatar with dropdown menu
            Logout button
            Dark mode toggle
    ELSE:
        RENDER:
            App logo/title
            Login/Register buttons
```

### Home Page
```
FUNCTION HomePage():
    GET shopping lists from Redux store
    GET loading state from Redux
    INITIALIZE dispatch
    
    ON component mount:
        DISPATCH fetchShoppingLists()
    
    RENDER:
        Page header with title
        "Create New List" button
        SearchAndFilter component
        Grid of ShoppingListCard components
        Loading skeleton when loading
        Empty state message if no lists
```

### Shopping List Card
```
FUNCTION ShoppingListCard(list):
    GET dispatch from Redux
    CALCULATE total items count
    CALCULATE completed items count
    
    ON edit click:
        OPEN edit dialog
    
    ON delete click:
        SHOW confirmation dialog
        IF confirmed:
            DISPATCH deleteShoppingList(list.id)
    
    ON card click:
        NAVIGATE to list detail page
    
    RENDER:
        Card with:
            List title and description
            Progress indicator (completed/total items)
            Last modified date
            Edit and delete buttons
            Category badge
```

### Shopping List Detail Page
```
FUNCTION ShoppingListDetailPage():
    GET listId from URL parameters
    GET current list and items from Redux
    GET loading state from Redux
    INITIALIZE dispatch
    
    ON component mount:
        DISPATCH fetchShoppingListItems(listId)
    
    ON add item:
        OPEN ShoppingItemForm dialog
    
    RENDER:
        Breadcrumb navigation
        List header with title and description
        SearchAndFilter component for items
        "Add Item" button
        List of ShoppingItemCard components
        Loading state
        Empty state if no items
```

### Shopping Item Card
```
FUNCTION ShoppingItemCard(item):
    GET dispatch from Redux
    
    ON toggle completed:
        DISPATCH updateShoppingItem(item.id, { completed: !item.completed })
    
    ON edit click:
        OPEN ShoppingItemForm dialog with item data
    
    ON delete click:
        SHOW confirmation dialog
        IF confirmed:
            DISPATCH deleteShoppingItem(item.id)
    
    RENDER:
        Card with:
            Item image (if available)
            Item name and description
            Quantity and category
            Notes section
            Completed checkbox
            Edit and delete buttons
```

### Search and Filter Component
```
FUNCTION SearchAndFilter():
    GET search query, sort option, and filter from Redux
    GET dispatch from Redux
    
    ON search input change:
        DEBOUNCE input (300ms)
        DISPATCH setSearchQuery(value)
    
    ON sort change:
        DISPATCH setSortBy(value)
    
    ON category filter change:
        DISPATCH setFilterCategory(value)
    
    RENDER:
        Search input field
        Sort dropdown (name, date, category)
        Category filter dropdown
        Clear filters button
```

### Shopping Item Form
```
FUNCTION ShoppingItemForm(item?, listId, onClose):
    INITIALIZE form state with item data or defaults
    INITIALIZE form validation
    GET dispatch from Redux
    
    ON form submit:
        VALIDATE all fields
        IF valid:
            IF editing existing item:
                DISPATCH updateShoppingItem(item.id, formData)
            ELSE:
                DISPATCH addShoppingItem(listId, formData)
            CALL onClose()
        ELSE:
            SHOW validation errors
    
    RENDER:
        Dialog with form fields:
            Item name (required)
            Quantity (required, number)
            Category (dropdown)
            Notes (textarea)
            Image upload
            Save and Cancel buttons
```

### Create List Dialog
```
FUNCTION CreateListDialog(isOpen, onClose):
    INITIALIZE form state (title, description)
    GET dispatch from Redux
    
    ON form submit:
        VALIDATE fields
        IF valid:
            DISPATCH createShoppingList(formData)
            CALL onClose()
        ELSE:
            SHOW validation errors
    
    RENDER:
        Dialog with:
            List title input (required)
            Description textarea
            Create and Cancel buttons
```

### Profile Page
```
FUNCTION ProfilePage():
    GET current user from Redux
    GET auth state from Redux
    INITIALIZE form state with user data
    INITIALIZE dispatch
    
    ON form submit:
        VALIDATE fields
        IF valid:
            DISPATCH updateProfile(formData)
        ELSE:
            SHOW validation errors
    
    RENDER:
        Profile form with:
            Username field
            Email field
            Password change section
            Save button
        Account statistics:
            Total lists count
            Total items count
            Account creation date
```

## 5. API INTEGRATION

### API Utilities
```
DEFINE BaseURL = "http://localhost:3001"

FUNCTION apiRequest(endpoint, options):
    GET auth token from localStorage
    SET default headers with Authorization
    
    TRY:
        MAKE fetch request to BaseURL + endpoint
        IF response is not ok:
            THROW error with status
        RETURN response.json()
    CATCH error:
        IF error is 401 (unauthorized):
            CLEAR auth token
            REDIRECT to login
        THROW error

API ENDPOINTS:
    
    // Authentication
    POST /auth/login - Login user
    POST /auth/register - Register new user
    GET /auth/verify - Verify token
    
    // Shopping Lists
    GET /shopping-lists - Get user's lists
    POST /shopping-lists - Create new list
    PUT /shopping-lists/:id - Update list
    DELETE /shopping-lists/:id - Delete list
    
    // Shopping Items
    GET /shopping-lists/:listId/items - Get list items
    POST /shopping-lists/:listId/items - Add item
    PUT /items/:id - Update item
    DELETE /items/:id - Delete item
    
    // User Profile
    GET /profile - Get user profile
    PUT /profile - Update user profile
```

## 6. ROUTING AND NAVIGATION

```
DEFINE Routes:
    
    Public Routes (no authentication required):
        /login - LoginForm component
        /register - RegisterForm component
    
    Protected Routes (authentication required):
        / - HomePage component
        /profile - ProfilePage component
        /list/:listId - ShoppingListDetailPage component
    
    Catch-all:
        * - Redirect to home page

NAVIGATION FLOW:
    
    User visits site:
        IF authenticated -> Redirect to home
        ELSE -> Show login page
    
    User logs in successfully:
        -> Redirect to home page
    
    User clicks on shopping list:
        -> Navigate to /list/:listId
    
    User clicks profile:
        -> Navigate to /profile
    
    User logs out:
        -> Redirect to login page
```

## 7. UTILITY FUNCTIONS

### Authentication Utilities
```
FUNCTION hashPassword(password):
    USE simple character code shifting for encryption
    RETURN encrypted password

FUNCTION verifyPassword(password, hashedPassword):
    HASH provided password
    COMPARE with stored hash
    RETURN boolean result

FUNCTION generateToken(user):
    CREATE simple token with user ID and timestamp
    RETURN token string

FUNCTION verifyToken(token):
    PARSE token
    CHECK expiration
    RETURN user data if valid, null if invalid
```

### Debounce Hook
```
FUNCTION useDebounce(value, delay):
    INITIALIZE debouncedValue state with value
    
    USE effect with dependencies [value, delay]:
        SET timeout to update debouncedValue after delay
        RETURN cleanup function to clear timeout
    
    RETURN debouncedValue
```

## 8. DATA MODELS

```
DEFINE User:
    id: string
    username: string
    email: string
    password: string (hashed)
    createdAt: date
    updatedAt: date

DEFINE ShoppingList:
    id: string
    title: string
    description: string
    userId: string
    createdAt: date
    updatedAt: date
    category: string
    isShared: boolean

DEFINE ShoppingItem:
    id: string
    name: string
    quantity: number
    notes: string
    category: string
    completed: boolean
    imageUrl: string (optional)
    listId: string
    createdAt: date
    updatedAt: date
```

## 9. RESPONSIVE DESIGN CONSIDERATIONS

```
BREAKPOINT STRATEGY:
    Mobile: < 768px
        Single column layouts
        Stacked navigation
        Simplified item cards
        Touch-friendly buttons
    
    Tablet: 768px - 1024px
        Two column grid for lists
        Side navigation drawer
        Medium-sized item cards
    
    Desktop: > 1024px
        Multi-column grids
        Full navigation bar
        Detailed item cards
        Hover interactions

RESPONSIVE COMPONENTS:
    Grid systems adapt based on screen size
    Navigation collapses to hamburger on mobile
    Forms stack vertically on small screens
    Cards resize and reflow appropriately
```

## 10. ERROR HANDLING AND LOADING STATES

```
ERROR HANDLING STRATEGY:
    
    API Errors:
        CATCH network errors
        SHOW user-friendly error messages
        LOG errors for debugging
        PROVIDE retry mechanisms
    
    Form Validation:
        CLIENT-side validation for immediate feedback
        SERVER-side validation for security
        CLEAR error messages on field change
    
    Authentication Errors:
        HANDLE expired tokens
        REDIRECT to login when unauthorized
        PRESERVE intended destination
    
LOADING STATES:
    
    Page Loading:
        SHOW skeleton components
        DISABLE interactive elements
        PROVIDE loading indicators
    
    Form Submission:
        DISABLE submit buttons
        SHOW loading spinners
        PREVENT double submissions
```

