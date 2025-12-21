pipeline {
    agent any
    
    environment {
        DOCKER_HUB_REPO = 'ryukyucoding/myapp'
        DISCORD_WEBHOOK = credentials('discord-webhook-url')
    }
    
    stages {
        stage('Static Analysis') {
            steps {
                script {
                    echo "Running ESLint..."
                    sh 'npm install'
                    sh 'npm run lint'
                }
            }
        }
        
        stage('Build & Deploy - Dev') {
            when {
                branch 'dev'
            }
            steps {
                script {
                    def imageTag = "dev-${env.BUILD_NUMBER}"
                    
                    // Build Docker image
                    sh "docker build -t ${DOCKER_HUB_REPO}:${imageTag} ."
                    
                    // Push to Docker Hub
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', 
                                                      usernameVariable: 'DOCKER_USER', 
                                                      passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                        sh "docker push ${DOCKER_HUB_REPO}:${imageTag}"
                    }
                    
                    // Cleanup old container and image (force remove if exists)
                    sh '''
                        docker rm -f dev-app || true
                        docker stop dev-app || true
                    '''
                    
                    // Deploy to port 8081
                    sh "docker run -d --name dev-app -p 8081:3000 ${DOCKER_HUB_REPO}:${imageTag}"
                    
                    // Health check
                    sleep(time: 5, unit: 'SECONDS')
                    sh 'curl -f http://localhost:8081/health || exit 1'
                }
            }
        }
        
        stage('GitOps Promotion - Prod') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Read target tag from config
                    def targetTag = readFile('deploy.config').trim()
                    def prodTag = "prod-${env.BUILD_NUMBER}"
                    
                    // Pull, retag, and push
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', 
                                                      usernameVariable: 'DOCKER_USER', 
                                                      passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                        sh "docker pull ${DOCKER_HUB_REPO}:${targetTag}"
                        sh "docker tag ${DOCKER_HUB_REPO}:${targetTag} ${DOCKER_HUB_REPO}:${prodTag}"
                        sh "docker push ${DOCKER_HUB_REPO}:${prodTag}"
                    }
                    
                    // Cleanup old container (force remove if exists)
                    sh '''
                        docker rm -f prod-app || true
                        docker stop prod-app || true
                    '''
                    
                    // Deploy to production
                    sh "docker run -d --name prod-app -p 8082:3000 ${DOCKER_HUB_REPO}:${prodTag}"
                    
                    // Health check
                    sleep(time: 5, unit: 'SECONDS')
                    sh 'curl -f http://localhost:8082/health || exit 1'
                }
            }
        }
    }
    
    post {
        failure {
            script {
                def message = """
                ❌ **Build Failed**
                **Name:** Yu Chen
                **Student ID:** Your Student ID
                **Job:** ${env.JOB_NAME}
                **Build:** #${env.BUILD_NUMBER}
                **Repo:** ${env.GIT_URL}
                **Branch:** ${env.BRANCH_NAME}
                **Status:** ${currentBuild.currentResult}
              """
                
                sh """
                curl -H "Content-Type: application/json" \
                -X POST \
                -d '{"content": "${message}"}' \
                ${DISCORD_WEBHOOK}
                """
            }
        }
    }
}
