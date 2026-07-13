package com.hirehub.entity;

import java.io.Serializable;
import java.util.Objects;

public class SavedJobId implements Serializable {
    private Long user;
    private Long job;

    public SavedJobId() {}

    public SavedJobId(Long user, Long job) {
        this.user = user;
        this.job = job;
    }

    public Long getUser() {
        return user;
    }

    public void setUser(Long user) {
        this.user = user;
    }

    public Long getJob() {
        return job;
    }

    public void setJob(Long job) {
        this.job = job;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o) return false;
        SavedJobId that = (SavedJobId) o;
        return Objects.equals(user, that.user) && Objects.equals(job, that.job);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, job);
    }
}
