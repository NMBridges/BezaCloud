const {
    CreateTagsCommand,
    RunInstancesCommand,
    EC2Client,
    DescribeInstancesCommand,
} = require("@aws-sdk/client-ec2");
var ec2Client = new EC2Client({ region: "us-east-1"});

// Set the parameters
const instanceParams = {
    ImageId: "ami-071fe6e60c8fdb961", //AMI_ID
    InstanceType: "t2.micro",
    KeyName: "chargeAWS-discord", //KEY_PAIR_NAME
    MinCount: 1,
    MaxCount: 1,
};

// Tests to see if the AWS credentials are valid
const connectionTest = async () => {
    try {
        ec2Client = new EC2Client({ region: "us-east-1"});
        const data = await ec2Client.send(new DescribeInstancesCommand({}));
        console.log("Login successful");
        return true;
    } catch(err) {
        console.log("Error loggin in", err);
        return false;
    }
};

// Creates an instance
const createInstance = async () => {
    try {
        const data = await ec2Client.send(new RunInstancesCommand(instanceParams));
        console.log(data.Instances[0].InstanceId);
        const instanceId = data.Instances[0].InstanceId;
        console.log("Created instance", instanceId);
        // Add tags to the instance
        const tagParams = {
            Resources: [instanceId],
            Tags: [
                {
                    Key: "Name",
                    Value: "Brooooo",
                },
                {
                    Key: "Cert",
                    Value: "VXE/LXhhaVQ/ZGJwdWdoa0FycTVDbVF1dz9IKWQ0M1g=",
                },
            ],
        };
        try {
            const data = await ec2Client.send(new CreateTagsCommand(tagParams));
            console.log("Instance tagged");
        } catch (err) {
            console.log("Error", err);
        }
    } catch (err) {
        console.log("Error", err);
    }
};

module.exports = { connectionTest };