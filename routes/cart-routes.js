const express = require('express');
const firebase = require('../db');
const Member = require('../models/member');
const Product = require('../models/product')
const firestore = firebase.firestore();
const admin = require('firebase-admin');
const { database } = require('firebase-admin');
const router = express.Router();

//API สำหรับการสมัครสมาชิกแอปพลิเคชัน
router.post('/newMember', async (req, res, next) => {
    try {
        const data = req.body;
        await firestore.collection('members').doc().set(data)
        res.json({ status: 'ok', data: 'Record saved successfuly' });
    } catch (error) {
        res.status(400).json({ status: 'error', data: error.message });
    }
});

//API สำหรับเพิ่มข้อมูลสินค้า
router.post('/product', async (req, res, next) => {
    try {
        const { fruit, weight, price } = req.body;
        await firestore.collection('products').doc(fruit).set({
            weight,
            price
        })
        res.json({ status: 'ok', data: 'Record saved successfuly' });
    } catch (error) {
        res.json({ status: 'error', data: error.message });
    }
});

//API สำหรับใช้ในการ Login เข้าสู่ระบบ
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body
    try {
        const members = await firestore.collection('members');
        const data = await members.where("username", "==", username).where("password", "==", password).get();
        let id
        data.forEach(snapshot => id = snapshot.id)
        if (data.empty) {
            res.json({ status: 'error', data: "Not found" });
        } else {
            res.json({ status: 'ok', id: id });
        }
    } catch (error) {
        res.json({ status: 'error', data: error.message });
    }
});

//API สำหรับเพิ่มของในตะกร้าสินค้า
router.put('/cart', async (req, res, next) => {
    const { fruit, weight, id } = req.body
    try {
        const member = await firestore.collection('members')
        console.log();
        const doc = await member.doc(id).get()
        console.log(2);
        let cart = doc.data().cart
        console.log(3);
        cart[fruit] = {
            weight: weight
        }
        await member.doc(id).update({
            cart: cart
        })
        console.log(4);
        res.json({ status: 'ok' })
    } catch (err) {
        res.json({ status: 'error', error: err.message })
    }
});

router.post('/cart', async (req, res, next) => {
    const { id } = req.body
    try {
        const member = await firestore.collection('members')
        const doc = await member.doc(id).get()
        res.json(doc.data().cart)
    } catch (err) {
        res.json({ status: 'error', error: err.message })
    }
});
    
//API สำหรับซื้อสินค้า เมื่อซื้อแล้วให้ทำการลบจำนวนสินค้าใน database
router.put('/checkout', async (req, res, next) => {
        const { id } = req.body
        try {
        const member = await firestore.collection('members')
        const memberDoc = await member.doc(id).get()
        const productDoc = await firestore.collection('products').get()
        let products = {}
        productDoc.forEach(doc => {
            products[doc.id] = {
                price: doc.data().price,
                weight: doc.data().weight
            }
        })

        let memberCart = memberDoc.data().cart
        let total = {
            price: 0,
            detail: memberCart
        }
        for (let i in memberCart) {
            products[i].weight -= memberCart[i].weight
            await firestore.collection('products').doc(i).update({
                weight: products[i].weight
            })
            total.price += memberCart[i].weight * memberCart[i].price

        }

        await member.doc(id).update({
            cart: {}
        })

        res.json({ status: 'ok' , total: total })
    } catch (err) {
        res.json({ status: 'error', error: err.message })
    }
});

module.exports = router

// try {
    //     const { fruitName, price, amount } = req.body
    //     const member = await firestore.collection('members').doc('AIcZzq3xNUFGBpTnsDEK');
    //     const unionRes = await member.update({
    //         cart: admin.firestore.FieldValue.arrayUnion()
    //       });
    //     console.log(unionRes)
    //     res.send(unionRes)
    // } catch (error) {
    //     res.status(400).send(error.message);
    // }

// router.get('/members', async (req, res, next) => {
//     try {
//         const members = await firestore.collection('members');
//         const data = await members.get();
//         const membersObj = {};
//         if(data.empty) {
//             res.status(404).send('No member record found');
//         }else {
//             data.forEach(doc => {
//                 const member = new Members(
//                     doc.id,
//                     doc.data().firstName,
//                     doc.data().lastName,
//                     doc.data().age,
//                     doc.data().phoneNumber,
//                     doc.data().status
//                 );
//                 ProductObj[product.fruit] = {
//                     price: product[price],
//                     amount: product[amount]
//                 }

//             });
//             res.send(MembersArray);
//         }
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// router.post('/student', async (req, res, next) => {
//     try {
//         const data = req.body;
//         await firestore.collection('students').doc().set(data)
//         res.send('Record saved successfully');
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// router.get('/members', async (req, res, next) => {
//     try {
//         const members = await firestore.collection('members');
//         const data = await members.get();
//         const membersObj = {};
//         if(data.empty) {
//             res.status(404).send('No member record found');
//         }else {
//             data.forEach(doc => {
//                 const member = new Members(
//                     doc.id,
//                     doc.data().firstName,
//                     doc.data().lastName,
//                     doc.data().age,
//                     doc.data().phoneNumber,
//                     doc.data().status
//                 );
//                 ProductObj[product.fruit] = {
//                     price: product[price],
//                     amount: product[amount]
//                 }

//             });
//             res.send(MembersArray);
//         }
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// router.get('/student/:id', async (req, res, next) => {
//     try {
//         const id = req.params.id;
//         const student = await firestore.collection('students').doc(id);
//         const data = await student.get();
//         if(!data.exists) {
//             res.status(404).send('Student with the given ID not found');
//         }else {
//             res.send(data.data());
//         }
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

    //     try {
    //         const members = await firestore.collection('members');
    //         const data = await members.get();
    //         const membersObj = {};
    //         if(data.empty) {
    //             res.status(404).send('No member record found');
    //         }else {
    //             data.forEach(doc => {
    // 
    //                 ProductObj[product.fruit] = {
    //                     price: product[price],
    //                     amount: product[amount]
    //                 }

    //             });
    //             res.send(MembersArray);
    //         }
    //     } catch (error) {
    //         res.status(400).send(error.message);
    //     }
    // });

// router.put('/student/:id', async (req, res, next) => {
//     try {
//         const id = req.params.id;
//         const data = req.body;
//         const student =  await firestore.collection('students').doc(id);
//         await student.update(data);
//         res.send('Student record updated successfuly');        
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// router.delete('/student/:id', async (req, res, next) => {
//     try {
//         const id = req.params.id;
//         await firestore.collection('students').doc(id).delete();
//         res.send('Record deleted successfuly');
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });


