const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "z44tfti8i8rg",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "POG9CcD80fajd2jByF17tBBPenhldRrc6J0sxgvOMl4"
});

console.log(client);

const cartbtn = document.querySelector(".cart-btn");
const closebtn = document.querySelector(".close");
const clearcartbtn = document.querySelector(".clearcart");
const cartDOM = document.querySelector(".cart");
const cartoverlay = document.querySelector(".cart-overlay");
const cartitems = document.querySelector(".cart-items");
const carttotal = document.querySelector(".carttotal");
const cartcontent = document.querySelector(".cart-content");
const productDOM = document.querySelector(".productitems");

// declaration of cart items storing in array
let cart = [];
let buttondom = [];

//geeting the product(we are creating an asynchronous method)
class Products {
  async getproducts() {
    try {
      let contenful = await client.getEntries({
        content_type: "electronicsbestbuy"
      });
      //console.log(contenful);
      //let result = await fetch("products.json");
      //let data = await result.json();
      let products = contenful.items;

      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//displaying the product in ui after geeting the product using a method
class UI {
  displayproduct(products) {
    let results = "";
    products.forEach(product => {
      results += `<article class="product">
          <div class="imagecontainer">
            <img src=${product.image} alt="laptop" class="productimage" />
            <button class="addto-cart-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h2>
        </article>`;
    });
    productDOM.innerHTML = results;
  }

  //method to add the cart
  addtocart() {
    //button is in nodelist convert it into an array
    const buttontocart = [...document.querySelectorAll(".addto-cart-btn")];
    buttondom = buttontocart;
    buttontocart.forEach(button => {
      let id = button.dataset.id;
      let incart = cart.find(item => item.id == id);
      if (incart) {
        button.innerText = "in the cart";
        button.disabled = true;
      }

      button.addEventListener("click", event => {
        event.target.innerText = "in the cart";
        event.target.disabled = true;
        //get the products from  product
        let cartitem = { ...storage.getproduct(id), amount: 1 };

        //add the product to the cart
        cart = [...cart, cartitem];
        //save the cart in local storage
        storage.savecart(cart);
        //set cart values
        this.setcartvalues(cart);
        //displsay cart item
        this.addcaritem(cartitem);
        //show the cart
      });
    });
  }
  setcartvalues(cart) {
    let temptotal = 0;
    let itemtotal = 0;
    cart.map(item => {
      temptotal += item.price * item.amount;
      itemtotal += item.amount;
    });
    carttotal.innerText = parseFloat(temptotal.toFixed(2));
    cartitems.innerText = itemtotal;
  }
  addcaritem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = ` <img src=${item.image} alt="product"/>
      <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="removeitem" data-id=${item.id}>remove</span>
            </div >
      <div>
        <i class="fas fa-chevron-up " data-id=${item.id}></i>
        <p class="itemamount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
      </div>`;
    cartcontent.appendChild(div);
  }
  showcart() {
    cartoverlay.classList.add("transparentBCG");
    cartDOM.classList.add("showcart");
  }
  hidecart() {
    cartoverlay.classList.remove("transparentBCG");
    cartDOM.classList.remove("showcart");
  }
  cartlogic() {
    //clear cartbutton
    clearcartbtn.addEventListener("click", () => {
      this.clearcart();
    });
    //cart functionality
    cartcontent.addEventListener("click", event => {
      if (event.target.classList.contains("removeitem")) {
        let removeitem = event.target;
        let id = removeitem.dataset.id;
        cartcontent.removeChild(removeitem.parentElement.parentElement);
        this.removeitem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addamount = event.target;
        let id = addamount.dataset.id;
        let tempitem = cart.find(item => item.id === id);
        tempitem.amount = tempitem.amount + 1;
        storage.savecart(cart);
        this.setcartvalues(cart);
        addamount.nextElementSibling.innerText = tempitem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowamount = event.target;
        let id = lowamount.dataset.id;
        let tempitem = cart.find(item => item.id === id);
        tempitem.amount = tempitem.amount - 1;
        if (tempitem.amount > 0) {
          storage.savecart(cart);
          this.setcartvalues(cart);
          lowamount.previousElementSibling.innerText = tempitem.amount;
        } else {
          cartcontent.removeChild(lowamount.parentElement.parentElement);
          this.removeitem(id);
        }
      }
    });
  }
  clearcart() {
    let cartitems = cart.map(item => item.id);
    cartitems.forEach(id => this.removeitem(id));
    while (cartcontent.children.length > 0) {
      cartcontent.removeChild(cartcontent.children[0]);
    }
    this.hidecart();
  }
  removeitem(id) {
    cart = cart.filter(item => item.id != id);
    this.setcartvalues(cart);
    storage.savecart(cart);
    let button = this.getsinglebutton(id);
    button.disabled = false;
    button.innerHTML = `<i class ="fas fa-shopping-cart"></i>addtocart`;
  }
  getsinglebutton(id) {
    return buttondom.find(button => button.dataset.id === id);
  }
  setupapp() {
    cart = storage.getcart();
    this.setcartvalues(cart);
    this.populatecart(cart);

    cartbtn.addEventListener("click", this.showcart);
    closebtn.addEventListener("click", this.hidecart);
  }

  populatecart(cart) {
    cart.forEach(item => this.addcaritem(item));
  }
}
//local storage

class storage {
  static saveproduct(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getproduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }
  static savecart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getcart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

//add event listeners

document.addEventListener("DOMContentLoaded", () => {
  //create an instance of product class and UI class
  const ui = new UI();
  const products = new Products();
  //setup app
  ui.setupapp();
  //get products
  products
    .getproducts()
    .then(products => {
      ui.displayproduct(products);
      storage.saveproduct(products);
    })
    .then(() => {
      ui.addtocart();
      ui.cartlogic();
    });
});
