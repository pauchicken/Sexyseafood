document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const sellForm = document.getElementById('sell-form');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const buyButton = document.getElementById('buy-button');

    let currentProduct = null;

    function loadProducts() {
        fetch('/api/products')
            .then(response => response.json())
            .then(products => {
                productList.innerHTML = '';
                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <h3>${product.name}</h3>
                        <p>$${product.price.toFixed(2)}</p>
                        <p>${product.description}</p>
                    `;
                    productCard.addEventListener('click', () => showProductDetails(product));
                    productList.appendChild(productCard);
                });
            });
    }

    function showProductDetails(product) {
        currentProduct = product;
        document.getElementById('modal-title').textContent = product.name;
        document.getElementById('modal-price').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('modal-description').textContent = product.description;
        modal.style.display = 'block';
    }

    closeModal.onclick = () => {
        modal.style.display = 'none';
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    buyButton.onclick = () => {
        if (currentProduct) {
            fetch(`/api/buy/${currentProduct.id}`, { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    modal.style.display = 'none';
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to purchase the product. Please try again.');
                });
        }
    }

    sellForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(sellForm);
        const newProduct = {
            name: formData.get('name'),
            price: parseFloat(formData.get('price')),
            description: formData.get('description')
        };

        fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProduct),
        })
        .then(response => response.json())
        .then(product => {
            alert(`Successfully listed ${product.name}`);
            sellForm.reset();
            loadProducts();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Failed to list the product. Please try again.');
        });
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');
        });
    });

    loadProducts();
});