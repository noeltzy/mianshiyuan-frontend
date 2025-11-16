"use client";

import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/layout/container";
import { ProfilePage } from "@/components/profile/profile-page";

export default function Profile() {
  return (
    <>
      <Navbar />
      <Container variant="default" className="py-8">
        <div className="mx-auto max-w-6xl px-4">
          <ProfilePage />
        </div>
      </Container>
    </>
  );
}
