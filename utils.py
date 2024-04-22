import yaml

class Config:
    @classmethod
    def load(cls, filename):
        global data
        with open(filename, 'r') as file:
            data = yaml.safe_load(file)
            
            credentials = cls()
            for key, value in data.items():
                setattr(credentials, key, value)
            return credentials