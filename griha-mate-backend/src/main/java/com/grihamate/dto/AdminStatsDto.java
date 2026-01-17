package com.grihamate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsDto {
    private Long totalUsers;
    private Long verifiedUsers;
    private Long pendingUsers;

    private Long totalProperties;
    private Long verifiedProperties;
    private Long pendingProperties;

    private Long totalRoomRequests;
    private Long totalPropertyInquiries;

    private List<Map<String, Object>> growthData;
}
