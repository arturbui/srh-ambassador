export default async (policyContext, {strapi},)=>{
    const currentUser = policyContext.state.user;
    const eventId = policyContext.params.id;

    if(!currentUser || typeof eventId === 'undefined'){
        return false;
    }

    const event = await strapi.documents('api::event.event').findOne({
        documentId: eventId,
        populate: {
        host: {
            fields:['documentId']
        }    
        }
    });

    if(!event || !event.host){
        return false;
    }

    return event.host?.documentId === currentUser.documentId;
}