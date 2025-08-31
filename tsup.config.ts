import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.tsx',
    'src/async/index.tsx',
    'src/dynamic-routes/index.ts',
    'src/dynamic-routes/next-10/index.ts',
    'src/dynamic-routes/next-11/index.ts',
    'src/dynamic-routes/next-12/index.ts',
    'src/dynamic-routes/next-13/index.ts',
    'src/MemoryRouterProvider/index.ts',
    'src/MemoryRouterProvider/next-10/index.tsx',
    'src/MemoryRouterProvider/next-11/index.tsx',
    'src/MemoryRouterProvider/next-12/index.tsx',
    'src/MemoryRouterProvider/next-13/index.tsx',
    'src/MemoryRouterProvider/next-13.5/index.tsx',
    'src/navigation/index.tsx',
  ],
  format: ['cjs'],
  target: 'es2019',
  outDir: 'dist',
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  // Ensure proper CJS exports without __esModule issues
  cjsInterop: true
})
