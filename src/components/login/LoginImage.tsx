// src/app/login/components/LoginImage.tsx

// Este es un "Componente de Servidor" por defecto en Next.js.
// No necesita interactividad, solo muestra una imagen.
const LoginImage = () => {
  return (
    <div className="hidden bg-muted lg:block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/placeholder.svg" // Placeholder para evitar errores de Next.js
        alt="Imagen de fondo de un corte de carne"
        width="1920"
        height="1080"
        className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1551028150-64b9f398f67b?q=80&w=1974&auto=format&fit=crop')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
};

export default LoginImage;
