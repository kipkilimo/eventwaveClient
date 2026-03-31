<template>
  <v-card
    class="event-header mb-4"
    :color="event.branding?.themeColor || 'primary'"
    dark
  >
    <v-img
      v-if="event.branding?.bannerBg"
      :src="event.branding.bannerBg"
      height="200"
      cover
    >
      <v-container fill-height>
        <v-row align="center" justify="center">
          <v-col cols="12" class="text-center">
            <h1 class="display-1">{{ event.title }}</h1>
            <p class="subtitle-1">{{ event.description }}</p>
          </v-col>
        </v-row>
      </v-container>
    </v-img>

    <v-container v-else>
      <v-row align="center">
        <v-col cols="12">
          <h1 class="display-1">{{ event.title }}</h1>
          <p class="subtitle-1">{{ event.description }}</p>
        </v-col>
      </v-row>
    </v-container>

    <v-divider></v-divider>

    <v-card-actions>
      <v-chip class="mr-2">
        <v-icon left>mdi-calendar</v-icon>
        {{ formatDate(event.dateTime.start.$date) }}
      </v-chip>
      <v-chip class="mr-2">
        <v-icon left>mdi-clock-outline</v-icon>
        {{ formatTime(event.dateTime.start.$date) }} -
        {{ formatTime(event.dateTime.end.$date) }}
      </v-chip>
      <v-chip v-if="!event.location.isVirtual" class="mr-2">
        <v-icon left>mdi-map-marker</v-icon>
        {{ event.location.name }}
      </v-chip>
      <v-chip v-else>
        <v-icon left>mdi-video</v-icon>
        Virtual Event
      </v-chip>
      <v-spacer></v-spacer>
      <v-chip :color="getRoleColor(role)" dark>
        <v-icon left>{{ getRoleIcon(role) }}</v-icon>
        {{ getRoleLabel(role) }} View
      </v-chip>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "EventHeader",
  props: {
    event: {
      type: Object,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
  },
  setup() {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getRoleColor = (role) => {
      const colors = {
        admin: "red",
        facilitator: "orange",
        participant: "green",
      };
      return colors[role] || "grey";
    };

    const getRoleIcon = (role) => {
      const icons = {
        admin: "mdi-account-crown",
        facilitator: "mdi-chalkboard",
        participant: "mdi-account",
      };
      return icons[role] || "mdi-account";
    };

    const getRoleLabel = (role) => {
      return role.charAt(0).toUpperCase() + role.slice(1);
    };

    return {
      formatDate,
      formatTime,
      getRoleColor,
      getRoleIcon,
      getRoleLabel,
    };
  },
};
</script>

<style scoped>
.event-header {
  border-radius: 12px;
  overflow: hidden;
}
</style>
