package com.jackpot.narratix.domain.controller.response;

import com.jackpot.narratix.domain.entity.ShareLink;

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

    public static ShareLinkActiveResponse of(ShareLink shareLink) {
        if(shareLink.isValid()){
            return ShareLinkActiveResponse.activate(shareLink.getShareId());
        }
        return ShareLinkActiveResponse.deactivate();
    }
}
