package com.jackpot.narratix.domain.controller.response;

public record ShareLinkActiveResponse(
        boolean active,
        String shareLinkId
) {

    public static ShareLinkActiveResponse activate(String shareLinkId){
        return new ShareLinkActiveResponse(true, shareLinkId);
    }

    public static ShareLinkActiveResponse deactivate(){
        return new ShareLinkActiveResponse(false, null);
    }
}
