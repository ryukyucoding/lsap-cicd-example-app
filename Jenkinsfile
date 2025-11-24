pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-24-LTS'
    }
    
    environment {
        APP_NAME = 'staging-app'
        APP_PORT = '8081'
        CONTAINER_PORT = '3000'
    }
    
    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${APP_NAME}:${BUILD_NUMBER}"
                    sh "docker build -t ${APP_NAME}:${BUILD_NUMBER} ."
                    sh "docker tag ${APP_NAME}:${BUILD_NUMBER} ${APP_NAME}:latest"
                }
            }
        }
        
        stage('Deploy and Verify') {
            steps {
                script {
                    echo "Stopping old container if exists..."
                    sh "docker stop ${APP_NAME} || true"
                    sh "docker rm ${APP_NAME} || true"
                    
                    echo "Starting new container..."
                    sh """
                        docker run -d \
                        --name ${APP_NAME} \
                        -p ${APP_PORT}:${CONTAINER_PORT} \
                        ${APP_NAME}:latest
                    """
                    
                    echo "Waiting for application to start..."
                    sleep 10
                    
                    echo "Performing health check..."
                    sh "curl -f http://localhost:${APP_PORT}/health || exit 1"
                    
                    echo "Deployment successful!"
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo "Application is running at http://localhost:${APP_PORT}"
        }
        failure {
            echo '❌ Pipeline failed!'
            sh "docker logs ${APP_NAME} || true"
        }
        always {
            echo 'Cleaning up old Docker images...'
            sh """
                docker image prune -f
            """
        }
    }
}