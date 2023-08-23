pipeline {
    agent {
        label 'linux'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup env'){
            steps {
                sh "echo "" > .env"
                sh "cp ./.base.env.example ./.base.env"
                echo 'Setup env success'
            }
        }
        stage('Login docker'){
            environment {
                DOCKER_LOGIN_INFO = credentials("ShartubeImageToken")
            }
            steps {
                sh ('echo $DOCKER_LOGIN_INFO_PSW | docker login -u $DOCKER_LOGIN_INFO_USR --password-stdin')
                echo 'Login Completed'
            }
            
        }
        stage('Build Docker Image') {
            steps {
                sh "docker compose build"
                echo 'Docker-compose-build Build Image Completed'
            }
        }
        stage("Push Docker Image"){
            steps {
                sh "docker compose push"
                echo 'Docker-compose-push Push Image Completed'
            }
        }
    }
    post {
        always { 
            sh "docker logout"
        }
    }
}