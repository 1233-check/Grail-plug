// Product data — 1 of 1 pieces, organized by size
const PRODUCTS = [
  {
    id:1, name:"FreeSoul Waxed Jacket", brand:"FREESOUL", category:"jackets",
    size:"M", sizeLabel:"Chest 36/38", price:4199, status:"sold",
    image:"images/hero-jacket.png",
    measurements:{Chest:"36/38",Length:"26 (from shoulder)",Sleeves:"27"},
    desc:"Rare waxed jacket from FreeSoul. Heavy texture, matte finish. 1 of 1."
  },
  {
    id:2, name:"Hugo Boss Germany Waxed Flared", brand:"HUGO BOSS", category:"denim",
    size:"30", sizeLabel:"Waist 30", price:4199, status:"available",
    image:"images/product-cargo.png",
    measurements:{Waist:"30",Rise:"9.5",Thigh:"21",Inseam:"28",Length:"39.5","Leg Opening":"8.5"},
    desc:"Hugo Boss Germany waxed flared denim. Raw selvedge edge detail. 1 of 1."
  },
  {
    id:3, name:"Armani Jeans Distressed", brand:"ARMANI", category:"denim",
    size:"32", sizeLabel:"Waist 32", price:1800, status:"available",
    image:"images/product-sneakers.png",
    measurements:{Waist:"32",Rise:"10",Thigh:"22",Inseam:"30",Length:"40"},
    desc:"Authentic Armani distressed jeans with heavy wash. Union Jack patch detail."
  },
  {
    id:4, name:"Archive Denim Collection", brand:"VARIOUS", category:"denim",
    size:"30", sizeLabel:"Waist 28-34", price:1200, status:"available",
    image:"images/product-tshirt.png",
    measurements:{Waist:"28-34 (multiple pieces)",Length:"varies"},
    desc:"Curated selection of vintage archive denim. Multiple washes & fits."
  },
  {
    id:5, name:"Vintage Leather Biker Jacket", brand:"ARCHIVE", category:"jackets",
    size:"L", sizeLabel:"Chest 40/42", price:3999, status:"available",
    image:"images/product-leather-jacket.png",
    measurements:{Chest:"40/42",Length:"27",Sleeves:"25"},
    desc:"Classic vintage leather biker jacket. Heavy patina, broken-in feel."
  },
  {
    id:6, name:"Cream Archive Hoodie", brand:"ARCHIVE", category:"tops",
    size:"XL", sizeLabel:"Chest 44", price:2200, status:"available",
    image:"images/product-hoodie.png",
    measurements:{Chest:"44",Length:"28",Sleeves:"26"},
    desc:"Heavyweight cream hoodie with vintage wash. Oversized fit."
  },
  {
    id:7, name:"Designer Crossbody Bag", brand:"ARCHIVE", category:"accessories",
    size:"OS", sizeLabel:"One Size", price:1500, status:"sold",
    image:"images/product-bag.png",
    measurements:{Height:"8",Width:"12",Depth:"3.5","Strap Drop":"22"},
    desc:"Vintage designer crossbody in dark brown leather. Beautiful patina."
  },
  {
    id:8, name:"Vintage Belt Silver Hardware", brand:"ARCHIVE", category:"accessories",
    size:"32", sizeLabel:"Waist 32", price:899, status:"available",
    image:"images/product-belt.png",
    measurements:{Length:"38",Width:"1.5"},
    desc:"Black leather belt with aged silver hardware. Classic archive piece."
  },
  {
    id:9, name:"Olive Cargo Wide-Leg", brand:"ARCHIVE", category:"pants",
    size:"34", sizeLabel:"Waist 34", price:1999, status:"available",
    image:"images/product-cargo.png",
    measurements:{Waist:"34",Rise:"11",Thigh:"24",Inseam:"30",Length:"41"},
    desc:"Military-inspired olive cargo. Wide-leg cut, heavy cotton."
  },
  {
    id:10, name:"Washed Black Graphic Tee", brand:"ARCHIVE", category:"tops",
    size:"L", sizeLabel:"Chest 42", price:1100, status:"sold",
    image:"images/product-tshirt.png",
    measurements:{Chest:"42",Length:"28",Sleeves:"9"},
    desc:"Faded vintage graphic tee in washed black. Single-stitch construction."
  },
  {
    id:11, name:"Distressed Slim Denim", brand:"FREESOUL", category:"denim",
    size:"28", sizeLabel:"Waist 28", price:1400, status:"available",
    image:"images/product-sneakers.png",
    measurements:{Waist:"28",Rise:"9",Thigh:"20",Inseam:"30",Length:"38"},
    desc:"FreeSoul slim fit distressed denim. Medium wash with whisker detail."
  },
  {
    id:12, name:"Dark Wash Bootcut Jeans", brand:"HUGO BOSS", category:"denim",
    size:"36", sizeLabel:"Waist 36", price:2400, status:"available",
    image:"images/hero-jacket.png",
    measurements:{Waist:"36",Rise:"10.5",Thigh:"24",Inseam:"32",Length:"42"},
    desc:"Hugo Boss dark wash bootcut. Heavier weight denim with subtle fading."
  }
];
