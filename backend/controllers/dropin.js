import { db, getUserById, updateDocument } from "../firebase.js";

/**
 * {
 *  dropin: The name of the dropin the user is leaving
 *  uid: The id of the user
 * }
 * 
 * @param {object} req The request object containing the request information
 * @param {object} res The response object that will be used to send a response to the client
 * @returns The response object
 */
export async function leaveDropin(req, res) {
    if(req.method !== 'POST')
        return res.status(400);

    const dropinName = req.body.dropin;
    const userId = req.body.uid;

    const facilitiesCollection = db.collection('facilities');
    const dropinDocRef = facilitiesCollection.doc(dropinName);
    const dropinDoc = await dropinDocRef.get();

    if(!dropinDoc.exists) 
        return res.status(200).json({
            success: false,
            msg: `No ${dropinName} dropin exists! Please try again!`
        });

    const dropinData = dropinDoc.data();
    const userData = await getUserById(userId);

    if(userData === undefined)
        return res.status(200).json({
            success: false,
            msg: "Unable to verify user!"
        });

    const dropinActiveUsers = dropinData.active_users_list;
    const userIndex = dropinActiveUsers.indexOf(userData.uid);

    if(userIndex <= -1)
        return res.status(200).json({
            success: false,
            msg: `User not found in the ${dropinName} dropin!`
        });

    dropinActiveUsers.splice(userIndex, 1);
    
    await updateDocument('facilities', dropinName, {active_users_list: dropinActiveUsers});

    return res.status(200).json({
        success: true
    });
}