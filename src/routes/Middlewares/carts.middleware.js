export const verificarPertenenciaCarrito = (req, res, next) =>{
    if(req.user.cart === req.params.cid){
        next()
    } else {
        res.send('Solo puedes agregar productos a tu propio carrito.');
    } 
}