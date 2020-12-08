const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.findAll({ where: { id: prodId } })
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {

    req.user.getCart().   //SELECT `product`.`id`, `product`.`title`, `product`.`price`, `product`.`imageUrl`, `product`.`description`, `product`.`createdAt`, `product`.`updatedAt`, `product`.`userId`,   // jodi 1 ta id  thakto taile direct id = 1...jodi ekadik thake tahole p.id = cart.id(we dont know how many will match), if too many on left table then left.id = right.id and vice versa
                          // `cartItem`.`id` AS `cartItem.id`, `cartItem`.`quantity` AS `cartItem.quantity`, `cartItem`.`createdAt` AS `cartItem.createdAt`, `cartItem`.`updatedAt` AS `cartItem.updatedAt`, `cartItem`.`cartId` AS `cartItem.cartId`, `cartItem`.`productId` AS `cartItem.productId` 
                          //FROM `products` AS `product` INNER JOIN `cartItems` AS `cartItem` ON `product`.`id` = `cartItem`.`productId` AND `cartItem`.`cartId` = 1;  means filter cartItem first, then filter prod and cartItem using prod id
    then(cart => {
      return cart.getProducts().  //cart and products are associated using cartItem table, so accessing product using cart will also provide cartItems attributes with the product details
      then( products => {
        // console.log('products', products);
        res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
              });
      }). 
      catch(err => { console.log(err)});  // cart belongs to user and product belongs to user , so both cart and product has user id
    }).  
    catch( err => {
        console.log(err);
    });
  // Cart.getCart(cart => {
  //   Product.fetchAll(products => {
  //     const cartProducts = [];
  //     for (product of products) {
  //       const cartProductData = cart.products.find(
  //         prod => prod.id === product.id
  //       );
  //       if (cartProductData) {
  //         cartProducts.push({ productData: product, qty: cartProductData.qty });
  //       }
  //     }
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Cart',
  //       products: cartProducts
  //     });
  //   });
  // });
};

exports.postCart = (req, res, next) => {
  let newQuantity = 1;
  const prodId = req.body.productId;
  let fetchedCart;
  req.user.getCart(). 
  then(cart => {
    fetchedCart = cart;
    return cart.getProducts({where: {id: prodId}});
  }). 
  then(products => {  //empty array if products doesn't exist
    let product;
    if(products.length > 0){
      product = products[0];
    }
  
    if(product) {  // product already exist , needs update
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
      return product;
    }
    return Product.findByPk(prodId);
  }).
  then(product => {
    return fetchedCart.addProduct(product, {through: {quantity: newQuantity}}); 

  }).
  then(()=>{
      res.redirect('/cart');
  }).
  catch(err => {
      console.log(err);
  })

  // Product.findById(prodId, product => {
  //   Cart.addProduct(prodId, product.price);
  // });
  // res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart().then(cart => {
      
        return cart.getProducts({where: {id: prodId}});
      }
  ).then(products => {
      const product = products[0];
      return product.cartItem.destroy();
  }).
  then(result => {
    res.redirect('/cart');
  }).
  catch(err => {
    console.log(err);
  });
  // Product.findByPk(prodId, product => {
  //   Cart.deleteProduct(prodId, product.price);
  //   res.redirect('/cart');
  // });
};
exports.postOrder = (req, res, next) => {
  let fetchedCart;
    req.user.getCart(). 
    then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    }). 
    then(products => {
      return req.user.createOrder(). 
      then(order => {
       return order.addProducts(products.map(product => { //will retrun a custom array
          product.orderItem = {quantity: product.cartItem.quantity};
          return product;
        }))
      }). 
      catch(err => {
        console.log(err);
      });
      // console.log(products);
    }).then(result => {
     return fetchedCart.setProducts(null);
        
    }).
    then(result => {
      res.redirect('/orders');
    }).
    catch(err => {
      console.log(err);
    });
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
