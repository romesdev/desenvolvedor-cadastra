import { Product } from "./Product";

const serverUrl = "http://localhost:5000/products";

let products: Product[] = []

let cartItemCount = 0;

const priceRanges = [
  { label: "de R$0 até R$50", min: 0, max: 50 },
  { label: "de R$51 até R$150", min: 51, max: 150 },
  { label: "de R$151 até R$300", min: 151, max: 300 },
  { label: "de R$301 até R$500", min: 301, max: 500 },
  { label: "a partir de R$500", min: 501, max: Infinity }
];

const currencyBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

let selectedColors: Set<string> = new Set();
let selectedPriceRanges: { min: number; max: number }[] = [];
let selectedSizes: Set<string> = new Set();

let filtersToApply = {
  colors: new Set<string>(),
  sizes: new Set<string>(),
  priceRanges: [] as { min: number; max: number }[],
};

function hasFilters(): boolean {
  return filtersToApply.colors.size > 0 ||
         filtersToApply.sizes.size > 0 ||
         filtersToApply.priceRanges.length > 0;
}

function resetFilters() {
  filtersToApply.colors.clear();
  filtersToApply.sizes.clear();
  filtersToApply.priceRanges = [];
}

type FilterType = 'color' | 'size' | 'price';

let currentProductIndex = 0;
let productsPerPage = 5;


function updateCartCount() {
  const cartCountElem = document.getElementById('cart-count');
  if (cartCountElem) {
    cartCountElem.textContent = cartItemCount.toString();
  }
}

function addToCart() {
  cartItemCount++;
  updateCartCount();
}

export async function fetchProducts(url: string): Promise<Product[]> {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Erro: ${response.statusText}`);
      }
      const data: Product[] = await response.json();
      products = data
      return data;
  } catch (error) {
      console.error("error on find data", error); 
      throw error;
  }
}

function renderProducts(products: Product[], append: boolean = false) {
  const productsContainer = document.getElementById('product-grid');
  if (!productsContainer) {
      console.error("element not found")
  }

  if (!append) {
    productsContainer.innerHTML = ''; 
  }

  products.forEach(product => {
      const productDiv = document.createElement('div');
      productDiv.classList.add('product-item');

      const productImage = document.createElement('img')
      productImage.src = product.image
      productDiv.appendChild(productImage)

      const productSubDiv = document.createElement('div')
      productDiv.appendChild(productSubDiv)

      const productName = document.createElement('h2');
      productName.textContent = product.name.toLocaleUpperCase();
      productSubDiv.appendChild(productName);

      const productPrice = document.createElement('h3');
      productPrice.textContent = currencyBRL.format(product.price)
      productSubDiv.appendChild(productPrice);

      const productParcelamento = document.createElement('p');
      const parcelamentoContent = `Até ${product.parcelamento[0]}x de ${currencyBRL.format(product.parcelamento[1])}`
      productParcelamento.textContent = parcelamentoContent;
      productSubDiv.appendChild(productParcelamento)

      const buyButton = document.createElement('button');
      buyButton.textContent = `COMPRAR`;
      buyButton.addEventListener('click', () => addToCart());
      productDiv.appendChild(buyButton);
  
      productsContainer.appendChild(productDiv);
    });
}

function renderFilterOptions() {
  const colorContainer = document.getElementById("color-container");
  const sizeContainer = document.getElementById("size-container");
  const priceContainer = document.getElementById("price-container");

  colorContainer.innerHTML = '';
  sizeContainer.innerHTML = '';
  priceContainer.innerHTML = '';

  
  priceRanges.forEach(priceRange => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('price-item');

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = priceRange.label;
      itemDiv.appendChild(input);

      const label = document.createElement('label');
      label.textContent = priceRange.label;
      itemDiv.appendChild(label);

      input.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        if (target.checked) {
          selectedPriceRanges.push({ min: priceRange.min, max: priceRange.max });
        } else {
          selectedPriceRanges = selectedPriceRanges.filter(range => range.min !== priceRange.min || range.max !== priceRange.max);
        }
      });

      priceContainer.appendChild(itemDiv);
    });

    const sizes = new Set<string>();

    products.forEach(product => {
      if (Array.isArray(product.size)) {
        product.size.forEach(size => sizes.add(size));
      } else {
        sizes.add(product.size);
      }
    });

    sizes.forEach(size => {
      const button = document.createElement('button');
      button.type = 'button';
      button.classList.add('size-button');
      button.textContent = size;

      button.addEventListener('click', () => {
        if (selectedSizes.has(size)) {
          selectedSizes.delete(size);
          button.classList.remove('selected');
        } else {
          selectedSizes.add(size);
          button.classList.add('selected');
        }
      });

      sizeContainer.appendChild(button);
    });

    const colors = new Set<string>();

    products.forEach(product => {
      colors.add(product.color)
    });


    colors.forEach(color => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add(`color-item`);

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = color.toString();
      itemDiv.appendChild(input);

      const label = document.createElement('label');
      label.textContent = color.toString();
      itemDiv.appendChild(label);

      input.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        if (target.checked) {
          selectedColors.add(target.value);
        } else {
          selectedColors.delete(target.value);
        }
      });

      colorContainer.appendChild(itemDiv);
    });
  }

function applyFilters() {
  const selectedColors = Array.from(document.querySelectorAll('input[name="color"]:checked')).map(input => (input as HTMLInputElement).value );
  // const selectedPrices = Array.from(document.querySelectorAll('input[name="price"]:checked')).map(input => (input as HTMLInputElement).value );
  const selectedSizes = Array.from(document.querySelectorAll('input[name="size"]:checked')).map(input => (input as HTMLInputElement).value );

  filtersToApply.colors = new Set(selectedColors);
  filtersToApply.sizes = new Set(selectedSizes);
  filtersToApply.priceRanges = [...selectedPriceRanges];

  return filterProducts()
}

function clearFilters() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => (checkbox as HTMLInputElement).checked = false);
  
  resetFilters()

  const loadMore = document.getElementById('load-more')
  loadMore.style.display = 'block'
  productsPerPage = 5


  renderProducts(products.slice(0, productsPerPage));
}

function filterProducts() {
  const filteredProducts = products.filter(product => {
    const productPrice = product.price;

    let isColorMatch = selectedColors.size === 0 || selectedColors.has(product.color);
    let isSizeMatch = selectedSizes.size === 0 || (Array.isArray(product.size) ? product.size.some(size => selectedSizes.has(size)) : selectedSizes.has(product.size));
    let isPriceMatch = selectedPriceRanges.length === 0 || selectedPriceRanges.some(range => {
      return productPrice >= range.min && productPrice <= range.max;
    });

    return isColorMatch && isSizeMatch && isPriceMatch;
  });
  
  // if (filteredProducts.length <= perPage) {
  //   const loadMore = document.getElementById('load-more')
  //   loadMore.style.display = 'none'
  // }

  return filteredProducts

  // renderProducts(filteredProducts.slice(0, perPage));
}

function sortProducts (sortedProducts: Product[], sortValue: string) {
  if(sortValue ==='1') {
    return sortedProducts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } if (sortValue === '2') {
    return sortedProducts.sort((a, b) => a.price - b.price)
  } if (sortValue === '3') {
    return sortedProducts.sort((a, b) => b.price - a.price)
  }
}

async function main() {
  try {
    const data = await fetchProducts(serverUrl);
    renderProducts(products.slice(0, productsPerPage));
    renderFilterOptions()

    const loadMore = document.getElementById('load-more')

    loadMore.addEventListener('click', function() {
      productsPerPage += 5

      if(hasFilters()) {
        const productsFiltered = applyFilters()
        const sortSelect = document.getElementById("sort-select") as HTMLSelectElement;
        const sortValue = sortSelect.value

        const sorted = sortValue !== "0" ? sortProducts(productsFiltered, sortValue) : productsFiltered
        if(productsPerPage >= sorted.length) {
          loadMore.style.display = 'none'
        } else {
          loadMore.style.display = 'block'
        }
        renderProducts(sorted.slice(0, productsPerPage))
      } else { 
        if(productsPerPage >= products.length) {
          loadMore.style.display = 'none'
        } else {
          loadMore.style.display = 'block'
        }
        renderProducts(products.slice(0, productsPerPage));
     }
    });
  
      // click to apply and clear filters
    document.getElementById('apply-filters')?.addEventListener('click', () => {
      const filteredProducts = applyFilters()

      if(productsPerPage >= filteredProducts.length) {
        loadMore.style.display = 'none'
      } else {
        loadMore.style.display = 'block'
      }

      const sortSelect = document.getElementById("sort-select") as HTMLSelectElement;
      const sortValue = sortSelect.value

      const sorted = sortValue !== "0" ? sortProducts(filteredProducts, sortValue) : filteredProducts

      renderProducts(sorted.slice(0, productsPerPage));
  });
    document.getElementById('clear-filters')?.addEventListener('click', clearFilters);
  
    // order products
    document.getElementById('sort-select')?.addEventListener('change', (e) => {
      const target =  e.target as HTMLTextAreaElement;
      const sortValue = target.value

      if(hasFilters()) {
        const products = applyFilters()
        const sorted = sortProducts(products, sortValue)

        if(productsPerPage >= sorted.length) {
          loadMore.style.display = 'none'
        }

        renderProducts(sorted.slice(0, productsPerPage))
        return
      }

      const products = sortProducts(data, sortValue)
      renderProducts(products.slice(0, productsPerPage))
    });
} catch (error) {
  console.error("error on load products", error);
}

}

document.addEventListener("DOMContentLoaded", main);

