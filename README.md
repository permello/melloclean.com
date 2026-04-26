![Melloclean.com banner](banner/banner.png)

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

Run the production server:

```bash
npm run start
```

## Deployment

### Docker

```bash
docker build -t melloclean .
docker run -p 3000:3000 melloclean
```
