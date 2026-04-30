import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    id: 101,
    title: "Arepa",
    price: 5000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
    images: [
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1"
    ],
    category: "comida",
    description: "Arepa tradicional colombiana."
  },
  {
    id: 102,
    title: "Empanada",
    price: 3000,
    stock: 10,
    image: "https://bogota.gov.co/sites/default/files/styles/1050px/public/2019-02/emapandas.png",
    images: [
      "https://bogota.gov.co/sites/default/files/styles/1050px/public/2019-02/emapandas.png"
    ],
    category: "comida",
    description: "Empanada crujiente rellena al estilo colombiano."
  },
  {
    id: 103,
    title: "Bandeja Paisa",
    price: 25000,
    stock: 10,
    image: "https://i.blogs.es/bb0cca/bandeja_paisa/1024_2000.jpg",
    images: [
      "https://i.blogs.es/bb0cca/bandeja_paisa/1024_2000.jpg"
    ],
    category: "comida",
    description: "Plato típico colombiano."
  },
  {
    id: 201,
    title: "Café Colombiano",
    price: 4000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
    images: [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93"
    ],
    category: "bebidas",
    description: "Café tradicional colombiano."
  },
  {
    id: 202,
    title: "Aguapanela",
    price: 2500,
    stock: 10,
    image: "https://cdn.colombia.com/gastronomia/2011/08/02/agua-de-panela-1595.gif",
    images: [
      "https://images.unsplash.com/photo-1589308078055-9187f1e4f90c"
    ],
    category: "bebidas",
    description: "Bebida caliente o fría hecha con panela."
  },
  {
    id: 203,
    title: "Ron Colombiano",
    price: 28000,
    stock: 10,
    image: "https://tiendacommerkvalle.com.co/wp-content/uploads/2025/03/ron-viejo-caldas-gran-reserva-especial-750-ml-1.png",
    images: [
      "https://tiendacommerkvalle.com.co/wp-content/uploads/2025/03/ron-viejo-caldas-gran-reserva-especial-750-ml-1.png"
    ],
    category: "bebidas",
    subcategory: "licores",
    description: "Licor colombiano."
  },
  {
    id: 301,
    title: "Mochila Wayuu",
    price: 80000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013",
    images: [
      "https://images.unsplash.com/photo-1618220179428-22790b461013"
    ],
    category: "artesanias",
    description: "Artesanía tradicional Wayuu."
  },
  {
    id: 302,
    title: "Sombrero Vueltiao",
    price: 60000,
    stock: 10,
    image: "https://mundodelganadero.com/cdn/shop/products/image_cfb3f664-edec-4994-8262-96bd24c282e4_540x.heic?v=1650406282",
    images: [
      "https://mundodelganadero.com/cdn/shop/products/image_cfb3f664-edec-4994-8262-96bd24c282e4_540x.heic?v=1650406282"
    ],
    category: "artesanias",
    description: "Sombrero típico colombiano."
  },
  {
    id: 401,
    title: "Camiseta Colombia",
    price: 45000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
    images: [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b"
    ],
    category: "ropa",
    description: "Camiseta inspirada en Colombia."
  },
  {
    id: 402,
    title: "Chaqueta Artesanal",
    price: 120000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1520974735194-8c3f97c49f92",
    images: [
      "https://images.unsplash.com/photo-1520974735194-8c3f97c49f92"
    ],
    category: "ropa",
    description: "Chaqueta con estilo artesanal."
  }
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
        images: product.images,
        category: product.category,
        subcategory: product.subcategory ?? null,
        seller: product.seller ?? null,
        isActive: true
      },
      create: {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
        images: product.images,
        category: product.category,
        subcategory: product.subcategory ?? null,
        seller: product.seller ?? null,
        isActive: true
      }
    });
  }

  console.log("Seed de productos ejecutado correctamente");
}

main()
  .catch((error) => {
    console.error("Error al ejecutar el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });