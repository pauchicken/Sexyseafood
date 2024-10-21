from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)


# Load initial products from a JSON file
def load_products():
    try:
        with open('products.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("products.json file not found. Creating an empty product list.")
        return []
    except json.JSONDecodeError:
        print("Error decoding products.json. Check if it's valid JSON.")
        return []


products = load_products()


@app.route('/')
def index():
    return render_template('index.html', products=products)


@app.route('/api/products', methods=['GET'])
def get_products():
    return jsonify(products)


@app.route('/api/products', methods=['POST'])
def add_product():
    new_product = request.json
    new_product['id'] = len(products) + 1
    products.append(new_product)

    # Save updated products to JSON file
    try:
        with open('products.json', 'w') as f:
            json.dump(products, f)
    except IOError:
        print("Error writing to products.json")
        return jsonify({"error": "Failed to save product"}), 500

    return jsonify(new_product), 201


@app.route('/api/buy/<int:product_id>', methods=['POST'])
def buy_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        # In a real application, you would handle the purchase logic here
        return jsonify({"message": f"Successfully purchased {product['name']}"}), 200
    return jsonify({"error": "Product not found"}), 404


@app.route('/debug')
def debug_info():
    return jsonify({
        "working_directory": os.getcwd(),
        "files_in_directory": os.listdir(),
        "products": products,
        "static_folder": app.static_folder,
        "template_folder": app.template_folder
    })


if __name__ == '__main__':
    app.run(debug=True)