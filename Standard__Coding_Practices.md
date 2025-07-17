# Standard Coding Practices - v0

0. Everything should be properly componentized. No repeatative code should be there.
1. Everything should be properly typed. There should be no `any` type anywhere in the codebase.
2. **.env.example** should be updated with all the environment variables that are needed to run the project.
3. There should not be any unused imports, variables, functions, types, npm packages, etc.
4. Use react-hook-form for form handling.
5. Form validations on the client side should be properly implemented using zod.
6. There should be a proper meaningful error handling in the codebase.
7. State management should be properly implemented with react-query. No unnecessary re-renders should be happening.
8. Meaningful loading states should be implemented.
9. Try to do as less prop drilling as possible, instead use context (if required) to pass data around.
10. Use lucide-icons for icons.
11. Use Shadcn UI for components.
12. Code formatting should be done properly using prettier. Install the prettier extension for VSCode (if not already installed).
13. Always use tailwind css for styling.
14. When using NextJs, always keep the static components in the server side and dynamic components in the client side.
15. Implement all the api related logic in the server side (api routes / server actions).


## Naming Conventions

- Components should be named in PascalCase, e.g. `MyComponent.tsx`
- Utility files should be named in kebab-case, e.g. `my-utility.ts`
- Pages should be named in PascalCase, e.g. `MyPage.tsx`
- Hooks should be named in camelCase, e.g. `useMyHook.ts`
- Types should be named in PascalCase and prefixed with `Type`, e.g. `TypeUser.ts`
- Constants should be named in PascalCase, e.g. `MyConstant.ts`
- Enums should be named in PascalCase and prefixed with `Enum`, e.g. `EnumUserRole.ts`
- Variables should be named in camelCase, e.g. `myVariable.ts`
- Folders should be named in kebab-case, e.g. `my-folder`
- Functions should be named in camelCase, e.g. `myFunction.ts`
- If creating a component of certain parent component the file name and component name should be ParentComponentName followed by component name in PascalCase, e.g. ModalShare.tsx (here modal is the parent component and share is the child component)


## Code Organization

- Components should be in the `src/components` folder
- Pages should be in the `src/pages` folder
- Hooks should be in the `src/hooks` folder
- Types should be in the `src/types` folder
- Constants should be in the `src/constants` folder
- Enums should be in the `src/enums` folder
- Keep the helper functions in the `src/utils` folder.


## Code Style

- Use arrow functions instead of function declarations, e.g. `() => {}` instead of `function() {}`
- Use template literals instead of string concatenation, e.g. `\`Hello ${name}\` instead of `'Hello ' + name`
- Use const for variables that are not reassigned, e.g. `const name = 'John'` instead of `let name = 'John'`
- Use let for variables that are reassigned, e.g. `let name = 'John'` instead of `const name = 'John'`
- Use const for constants, e.g. `const PI = 3.14` instead of `let PI = 3.14`
- Use const for objects and arrays, e.g. `const user = { name: 'John', age: 30 }` instead of `let user = { name: 'John', age: 30 }`
- Use const for functions, e.g. `const add = (a, b) => a + b` instead of `let add = (a, b) => a + b`

