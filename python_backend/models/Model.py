from datetime import datetime
from bson import ObjectId
from config.db import get_db

class Model:
    collection_name = None

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
        
        # Ensure _id is set if passed, or handled by MongoDB on insert
        if '_id' in kwargs and isinstance(kwargs['_id'], str):
            self._id = ObjectId(kwargs['_id'])

    @classmethod
    def get_collection(cls):
        db = get_db()
        if db is None:
            raise Exception("Database not connected")
        return db[cls.collection_name]

    def save(self):
        collection = self.get_collection()
        data = self.__dict__.copy()
        
        # Remove None values or handle defaults if needed? 
        # For now, we dump everything.
        # But we should remove keys that are not part of the document if they are internal
        
        if hasattr(self, '_id') and self._id:
            # Update
            collection.replace_one({'_id': self._id}, data, upsert=True)
        else:
            # Insert
            if 'createdAt' not in data:
                 data['createdAt'] = datetime.utcnow()
            # If updatedAt needed: data['updatedAt'] = datetime.now()
            
            result = collection.insert_one(data)
            self._id = result.inserted_id
            
        return self

    @classmethod
    def findOne(cls, query):
        collection = cls.get_collection()
        # Convert string ID to ObjectId if needed
        if '_id' in query and isinstance(query['_id'], str):
            query['_id'] = ObjectId(query['_id'])
            
        data = collection.find_one(query)
        if data:
            return cls(**data)
        return None

    @classmethod
    def findById(cls, id):
        if isinstance(id, str):
            id = ObjectId(id)
        return cls.findOne({'_id': id})

    @classmethod
    def find(cls, query=None, projection=None, sort=None, limit=0, skip=0):
        if query is None: query = {}
        collection = cls.get_collection()
        
        cursor = collection.find(query, projection)
        if sort:
            cursor = cursor.sort(sort)
        if skip:
            cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)
            
        results = []
        for doc in cursor:
            results.append(cls(**doc))
        return results

    @classmethod
    def findOneAndUpdate(cls, query, update, return_document=False, **kwargs):
        collection = cls.get_collection()
        
        # Convert string ID to ObjectId if needed
        if '_id' in query and isinstance(query['_id'], str):
            query['_id'] = ObjectId(query['_id'])

        # pymongo find_one_and_update returns the document *before* update by default
        # user return_document=True to get the new one
        from pymongo import ReturnDocument
        return_doc = ReturnDocument.AFTER if return_document or kwargs.get('new') else ReturnDocument.BEFORE
        
        data = collection.find_one_and_update(query, update, return_document=return_doc, **kwargs)
        if data:
            return cls(**data)
        return None

    @classmethod
    def findByIdAndUpdate(cls, id, update, **kwargs):
        if isinstance(id, str):
            id = ObjectId(id)
        return cls.findOneAndUpdate({'_id': id}, update, **kwargs)

    @classmethod
    def deleteOne(cls, query):
        collection = cls.get_collection()
        if '_id' in query and isinstance(query['_id'], str):
            query['_id'] = ObjectId(query['_id'])
        return collection.delete_one(query)

    @classmethod
    def deleteMany(cls, query):
        collection = cls.get_collection()
        return collection.delete_many(query)

    @classmethod
    def findByIdAndDelete(cls, id):
        if isinstance(id, str):
            id = ObjectId(id)
        collection = cls.get_collection()
        return collection.find_one_and_delete({'_id': id})
        
    @classmethod
    def countDocuments(cls, query):
        collection = cls.get_collection()
        return collection.count_documents(query)
