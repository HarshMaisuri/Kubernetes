provider "google" {
  project = "k8s-assignment-428200"
  region  = "us-central1"
  zone    = "us-central1-c"
  credentials = file("/home/maisuriharsh/k8s-assignment-428200-123c525000bf.json")
}

resource "google_container_cluster" "my_cluster" {
  name = "k8s-cluster"
  location = "us-central1"
  deletion_protection = false

  node_locations = ["us-central1-c"]

  node_config {
    machine_type = "e2-small"
    disk_size_gb = 10
    disk_type    = "pd-standard"
    image_type   = "COS_CONTAINERD"
  }
  
  initial_node_count = 1
}