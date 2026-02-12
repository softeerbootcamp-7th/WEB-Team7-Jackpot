package com.jackpot.narratix.domain.entity;

import com.github.f4b6a3.ulid.UlidCreator;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "share_link",
        indexes = @Index(name = "unique_idx_share_id", columnList = "share_id", unique = true)
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ShareLink {

    @Id
    @Column(name = "cover_letter_id")
    private Long coverLetterId;

    @Column(name = "share_id", nullable = false)
    private String shareId;

    @Column(name = "is_shared", nullable = false)
    private boolean isShared;

    @NotNull
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    private static final int DEFAULT_EXPIRATION_WEEKS = 2;

    public static ShareLink newActivatedShareLink(Long coverLetterId){

        return new ShareLink(
                coverLetterId,
                UlidCreator.getUlid().toString(),
                true,
                LocalDateTime.now().plusWeeks(DEFAULT_EXPIRATION_WEEKS)
        );
    }

    public void activate(){
        this.isShared = true;
        this.shareId = UlidCreator.getUlid().toString();
        this.expiresAt = LocalDateTime.now().plusWeeks(DEFAULT_EXPIRATION_WEEKS);
    }

    public void deactivate(){
        this.isShared = false;
    }

    public boolean isValid() {
        return this.isShared && this.expiresAt.isAfter(LocalDateTime.now());
    }
}